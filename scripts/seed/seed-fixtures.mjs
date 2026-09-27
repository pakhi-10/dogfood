import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

const fixturesPath = process.argv[2] ?? path.resolve('fixtures.json');
const fixtures = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/*
 * Fixture IDs such as:
 *   evt_01
 *   trk_01
 *   jdg_08
 *   tm_07
 *   prj_41
 *
 * are NOT PostgreSQL UUIDs.
 *
 * They are fixture keys only.
 * Every fixture key is deterministically mapped to a real UUID
 * before being inserted into UUID columns.
 */
const NAMESPACE = Buffer.from(
	'5e9b5f5d-2a31-4f7c-9f7f-0d4f8f7a9b11'.replaceAll('-', ''),
	'hex'
);

function uuidFromFixture(kind, fixtureId) {
	const input = Buffer.from(`${kind}:${fixtureId}`, 'utf8');

	const hash = crypto
		.createHash('sha1')
		.update(NAMESPACE)
		.update(input)
		.digest();

	// UUID v5-style version/variant bits.
	hash[6] = (hash[6] & 0x0f) | 0x50;
	hash[8] = (hash[8] & 0x3f) | 0x80;

	const hex = hash.subarray(0, 16).toString('hex');

	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
		12,
		16
	)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function emailName(email) {
	return email
		.split('@')[0]
		.replace(/[._-]+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertUser(client, { id, name, email, type }) {
	/*
	 * fixtures.json does not contain passwords.
	 *
	 * users.password is NOT NULL, so fixture users receive a placeholder
	 * value. This does NOT mean that these fixture accounts have a usable
	 * application login password.
	 */
	const fixturePassword = 'fixture-seed-account';

	await client.query(
		`INSERT INTO users
			(id, name, type, email, password)
		 VALUES
			($1, $2, $3, $4, $5)
		 ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			type = EXCLUDED.type,
			email = EXCLUDED.email`,
		[id, name, type, email, fixturePassword]
	);
}

async function ensureUserByEmail(client, { name, email, type }) {
	const normalizedEmail = email.toLowerCase();

	const id = uuidFromFixture('user-email', normalizedEmail);

	await upsertUser(client, {
		id,
		name,
		email: normalizedEmail,
		type
	});

	return id;
}

/* -------------------------------------------------------------------------- */
/* Event                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertEvent(client) {
	const event = fixtures.event;

	const eventId = uuidFromFixture('event', event.id);

	await client.query(
		`INSERT INTO events
			(id, name, submissions_close)
		 VALUES
			($1, $2, $3)
		 ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			submissions_close = EXCLUDED.submissions_close`,
		[
			eventId,
			event.name,
			event.submissions_close ?? null
		]
	);

	return eventId;
}

/* -------------------------------------------------------------------------- */
/* Tracks                                                                     */
/* -------------------------------------------------------------------------- */

async function upsertTrack(client, track, eventId) {
	const trackId = uuidFromFixture('track', track.id);

	await client.query(
		`INSERT INTO tracks
			(id, event_id, name, description)
		 VALUES
			($1, $2, $3, $4)
		 ON CONFLICT (id) DO UPDATE SET
			event_id = EXCLUDED.event_id,
			name = EXCLUDED.name,
			description = EXCLUDED.description`,
		[
			trackId,
			eventId,
			track.name,
			null
		]
	);

	return trackId;
}

/* -------------------------------------------------------------------------- */
/* Teams                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertTeam(
	client,
	team,
	eventId,
	memberUserIds
) {
	const teamId = uuidFromFixture('team', team.id);

	const leaderEmail =
		team.members[0]?.toLowerCase() ?? null;

	await client.query(
		`INSERT INTO teams
			(id, event_id, team_name, leader_email)
		 VALUES
			($1, $2, $3, $4)
		 ON CONFLICT (id) DO UPDATE SET
			event_id = EXCLUDED.event_id,
			team_name = EXCLUDED.team_name,
			leader_email = EXCLUDED.leader_email`,
		[
			teamId,
			eventId,
			team.name,
			leaderEmail
		]
	);

	for (const [index, email] of team.members.entries()) {
		const userId = memberUserIds[index];
		const normalizedEmail = email.toLowerCase();

		const existing = await client.query(
			`SELECT id
			 FROM team_members
			 WHERE team_id = $1
			   AND user_email = $2
			 LIMIT 1`,
			[
				teamId,
				normalizedEmail
			]
		);

		if (existing.rowCount === 0) {
			await client.query(
				`INSERT INTO team_members
					(id, team_id, joined_at, user_email)
				 VALUES
					($1, $2, CURRENT_TIMESTAMP, $3)`,
				[
					crypto.randomUUID(),
					teamId,
					normalizedEmail
				]
			);
		}

		/*
		 * userId is deliberately generated/ensured above so every
		 * team-member email corresponds to an actual users row.
		 */
		void userId;
	}

	return teamId;
}

/* -------------------------------------------------------------------------- */
/* Main seed                                                                  */
/* -------------------------------------------------------------------------- */

async function main() {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');

		/* ------------------------------------------------------------------ */
		/* Event                                                               */
		/* ------------------------------------------------------------------ */

		const eventId = await upsertEvent(client);

		/*
		 * Maps:
		 *
		 * fixture key -> actual PostgreSQL UUID
		 */
		const trackIds = new Map();
		const judgeIds = new Map();
		const teamIds = new Map();
		const projectIds = new Map();
		const criterionIds = new Map();

		/* ------------------------------------------------------------------ */
		/* Tracks                                                              */
		/* ------------------------------------------------------------------ */

		for (const track of fixtures.tracks) {
			const trackId = await upsertTrack(
				client,
				track,
				eventId
			);

			trackIds.set(track.id, trackId);
		}

		/* ------------------------------------------------------------------ */
		/* Judges                                                              */
		/* ------------------------------------------------------------------ */

		/*
		 * Judges are actual users.
		 *
		 * Example:
		 *
		 * jdg_08
		 *   ↓
		 * uuidFromFixture('user', 'jdg_08')
		 *   ↓
		 * users.id = actual UUID
		 */
		for (const judge of fixtures.judges) {
			const userId = await upsertUser(client, {
				id: uuidFromFixture('user', judge.id),
				name: judge.name,
				email: judge.email.toLowerCase(),
				type: 'judge'
			});

			judgeIds.set(judge.id, userId);

			/*
			 * Fixture judge track IDs are converted through trackIds.
			 *
			 * jdg_08 + trk_01
			 *        ↓
			 * actual judge UUID + actual track UUID
			 */
			for (const trackKey of judge.tracks) {
				const trackId = trackIds.get(trackKey);

				if (!trackId) {
					throw new Error(
						`Missing track mapping for judge ${judge.id}: ${trackKey}`
					);
				}

				await client.query(
					`INSERT INTO judge_track_eligibility
						(judge_id, track_id)
					 VALUES
						($1, $2)
					 ON CONFLICT (judge_id, track_id)
					 DO NOTHING`,
					[
						userId,
						trackId
					]
				);
			}
		}

		/* ------------------------------------------------------------------ */
		/* Teams + team members                                                */
		/* ------------------------------------------------------------------ */

		for (const team of fixtures.teams) {
			const memberUserIds = [];

			for (const email of team.members) {
				const userId = await ensureUserByEmail(client, {
					name: emailName(email),
					email,
					type: 'participant'
				});

				memberUserIds.push(userId);
			}

			const teamId = await upsertTeam(
				client,
				team,
				eventId,
				memberUserIds
			);

			teamIds.set(team.id, teamId);
		}

		/* ------------------------------------------------------------------ */
		/* Latest submission per team                                          */
		/* ------------------------------------------------------------------ */

		/*
		 * FINAL RULE:
		 *
		 * One team can submit only ONE project to an event.
		 *
		 * If the fixture contains multiple submissions for the same team,
		 * the latest submitted_at wins.
		 *
		 * Example:
		 *
		 * tm_07
		 *   ├── prj_07  2026-03-01T04:29:00Z
		 *   └── prj_41  2026-03-01T17:57:00Z  <-- retained
		 */
		const latestByTeam = new Map();

		for (const project of fixtures.projects) {
			const current = latestByTeam.get(project.team);

			if (
				!current ||
				new Date(project.submitted_at) >
					new Date(current.submitted_at)
			) {
				latestByTeam.set(project.team, project);
			}
		}

		/* ------------------------------------------------------------------ */
		/* Remove obsolete project rows                                       */
		/* ------------------------------------------------------------------ */

		for (const project of fixtures.projects) {
			const latest = latestByTeam.get(project.team);

			if (latest.id !== project.id) {
				await client.query(
					`DELETE FROM projects
					 WHERE id = $1`,
					[
						uuidFromFixture(
							'project',
							project.id
						)
					]
				);
			}
		}

		/* ------------------------------------------------------------------ */
		/* Projects                                                            */
		/* ------------------------------------------------------------------ */

		for (const project of latestByTeam.values()) {
			/*
			 * Fixture:
			 *
			 * prj_41
			 *
			 * Database:
			 *
			 * UUID generated deterministically from:
			 * project:prj_41
			 */
			const projectId = uuidFromFixture(
				'project',
				project.id
			);

			projectIds.set(
				project.id,
				projectId
			);

			const teamId = teamIds.get(project.team);
			const trackId = trackIds.get(project.track);

			if (!teamId) {
				throw new Error(
					`Missing team mapping for project ${project.id}: ${project.team}`
				);
			}

			if (!trackId) {
				throw new Error(
					`Missing track mapping for project ${project.id}: ${project.track}`
				);
			}

			await client.query(
				`INSERT INTO projects
					(
						id,
						team_id,
						track_id,
						title,
						summary,
						project_tagline,
						thumbnail,
						image_gallery,
						demo_video_url,
						repo_url,
						deployed_live_link,
						tech_tags,
						status,
						submitted_at
					)
				 VALUES
					(
						$1,
						$2,
						$3,
						$4,
						$5,
						NULL,
						NULL,
						NULL,
						NULL,
						$6,
						NULL,
						NULL,
						'submitted',
						$7
					)
				 ON CONFLICT (id) DO UPDATE SET
					team_id = EXCLUDED.team_id,
					track_id = EXCLUDED.track_id,
					title = EXCLUDED.title,
					summary = EXCLUDED.summary,
					repo_url = EXCLUDED.repo_url,
					status = EXCLUDED.status,
					submitted_at = EXCLUDED.submitted_at`,
				[
					projectId,
					teamId,
					trackId,
					project.title,
					project.summary ?? null,
					project.repo_url ?? null,
					project.submitted_at ?? null
				]
			);
		}

		/* ------------------------------------------------------------------ */
		/* Rubric criteria                                                     */
		/* ------------------------------------------------------------------ */

		for (const name of [
			'functionality',
			'quality',
			'innovation'
		]) {
			const criterionId = uuidFromFixture(
				'criterion',
				name
			);

			criterionIds.set(
				name,
				criterionId
			);

			await client.query(
				`INSERT INTO rubric_criteria
					(id, name, weight)
				 VALUES
					($1, $2, 1)
				 ON CONFLICT (id) DO UPDATE SET
					name = EXCLUDED.name,
					weight = EXCLUDED.weight`,
				[
					criterionId,
					name
				]
			);
		}

		/* ------------------------------------------------------------------ */
		/* Judge assignments + scores                                          */
		/* ------------------------------------------------------------------ */

		/*
		 * The fixture does not have a separate assignment list.
		 *
		 * The unique (judge, project) pairs appearing in scores define
		 * the judge assignments.
		 *
		 * Example:
		 *
		 * jdg_08 + prj_41
		 *       ↓
		 * actual judge UUID + actual project UUID
		 */
		for (const score of fixtures.scores) {
			const scoreProject = fixtures.projects.find(
				(project) => project.id === score.project
			);

			if (!scoreProject) {
				throw new Error(
					`Score references unknown project: ${score.project}`
				);
			}

			/*
			 * If this project is not the latest submission for its team,
			 * ignore its scores.
			 *
			 * Therefore prj_07's five scores are excluded because
			 * prj_41 is the final submission for tm_07.
			 */
			const finalProject = latestByTeam.get(
				scoreProject.team
			);

			if (
				!finalProject ||
				finalProject.id !== score.project
			) {
				continue;
			}

			const judgeId = judgeIds.get(score.judge);
			const projectId = projectIds.get(score.project);

			if (!judgeId) {
				throw new Error(
					`Missing judge mapping for ${score.judge}`
				);
			}

			if (!projectId) {
				throw new Error(
					`Missing project mapping for ${score.project}`
				);
			}

			const assignmentId = uuidFromFixture(
				'judge-assignment',
				`${score.judge}:${score.project}`
			);

			await client.query(
				`INSERT INTO judge_assignments
					(id, judge_id, project_id)
				 VALUES
					($1, $2, $3)
				 ON CONFLICT (id) DO UPDATE SET
					judge_id = EXCLUDED.judge_id,
					project_id = EXCLUDED.project_id`,
				[
					assignmentId,
					judgeId,
					projectId
				]
			);

			for (const [
				criterionName,
				value
			] of Object.entries(
				score.criteria ?? {}
			)) {
				const criterionId =
					criterionIds.get(criterionName);

				if (!criterionId) {
					throw new Error(
						`Unknown criterion: ${criterionName}`
					);
				}

				const scoreId = uuidFromFixture(
					'score',
					`${score.judge}:${score.project}:${criterionName}`
				);

				await client.query(
					`INSERT INTO scores
						(
							id,
							judge_assignment_id,
							criterion_id,
							score,
							comment
						)
					 VALUES
						(
							$1,
							$2,
							$3,
							$4,
							$5
						)
					 ON CONFLICT
							(judge_assignment_id, criterion_id)
					 DO UPDATE SET
							score = EXCLUDED.score,
							comment = EXCLUDED.comment`,
					[
						scoreId,
						assignmentId,
						criterionId,
						value,
						score.comment ?? null
					]
				);
			}
		}

		/* ------------------------------------------------------------------ */
		/* Commit                                                              */
		/* ------------------------------------------------------------------ */

		await client.query('COMMIT');

		console.log(
			'Fixture seed completed successfully.'
		);

		console.log(
			`Event: ${fixtures.event.id} -> ${eventId}`
		);

		console.log(
			`Tracks: ${fixtures.tracks.length}`
		);

		console.log(
			`Judges: ${fixtures.judges.length}`
		);

		console.log(
			`Teams: ${fixtures.teams.length}`
		);

		console.log(
			`Projects in fixture: ${fixtures.projects.length}`
		);

		console.log(
			`Projects kept: ${latestByTeam.size}`
		);

		console.log(
			'Latest submission rule applied: tm_07 -> prj_41; prj_07 and its scores were excluded.'
		);

		console.log(
			`Scores in fixture: ${fixtures.scores.length}`
		);

	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
		await pool.end();
	}
}

main().catch((error) => {
	console.error('Fixture seed failed.');
	console.error(error);
	process.exit(1);
});