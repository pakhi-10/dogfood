import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;

const fixturesPath =
	process.argv[2] ?? path.resolve('fixtures.json');

const fixtures = JSON.parse(
	fs.readFileSync(fixturesPath, 'utf8')
);

const DATABASE_URL =
	process.env.DATABASE_URL ||
	'postgresql://postgres:Pragya@06@localhost:5432/dogfood';

const pool = new Pool({
	connectionString: DATABASE_URL
});

/* -------------------------------------------------------------------------- */
/* Stable UUID generation                                                     */
/* -------------------------------------------------------------------------- */

const NAMESPACE = Buffer.from(
	'5e9b5f5d-2a31-4f7c-9f7f-0d4f8f7a9b11'.replaceAll(
		'-',
		''
	),
	'hex'
);

function uuidFromFixture(kind, fixtureId) {
	const input = Buffer.from(
		`${kind}:${fixtureId}`,
		'utf8'
	);

	const hash = crypto
		.createHash('sha1')
		.update(NAMESPACE)
		.update(input)
		.digest();

	hash[6] = (hash[6] & 0x0f) | 0x50;
	hash[8] = (hash[8] & 0x3f) | 0x80;

	const hex = hash
		.subarray(0, 16)
		.toString('hex');

	return (
		`${hex.slice(0, 8)}-` +
		`${hex.slice(8, 12)}-` +
		`${hex.slice(12, 16)}-` +
		`${hex.slice(16, 20)}-` +
		`${hex.slice(20, 32)}`
	);
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function emailName(email) {
	return email
		.split('@')[0]
		.replace(/[._-]+/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeRepoUrl(value) {
	if (!value) {
		return null;
	}

	const markdownMatch = value.match(
		/^\[.*?\]\((.*?)\)$/
	);

	return markdownMatch
		? markdownMatch[1]
		: value;
}

/*
 * IMPORTANT:
 *
 * Team identity is team.id.
 *
 * Team names are display values only.
 * Duplicate team names are therefore valid.
 */
function buildTeamNames(teams) {
	return new Map(
		teams.map((team) => [
			team.id,
			team.name
		])
	);
}

/*
 * A team can have multiple historical submissions.
 *
 * DOGFOOD's effective project is the latest submission
 * for that TEAM.
 *
 * We intentionally key only by project.team.
 *
 * Example:
 *
 *   tm_07
 *     prj_07 -> earlier
 *     prj_41 -> later
 *
 * Therefore prj_41 is retained.
 */
function buildLatestProjects(projects) {
	const latestByTeam = new Map();

	for (const project of projects) {
		const current =
			latestByTeam.get(project.team);

		if (
			!current ||
			new Date(project.submitted_at) >
				new Date(current.submitted_at)
		) {
			latestByTeam.set(
				project.team,
				project
			);
		}
	}

	return latestByTeam;
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertUser(
	client,
	{ id, name, email, type }
) {
	const fixturePassword =
		'fixture-seed-account';

	await client.query(
		`
		INSERT INTO users
			(
				id,
				name,
				type,
				email,
				password
			)
		VALUES
			($1, $2, $3, $4, $5)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			type = EXCLUDED.type,
			email = EXCLUDED.email
		`,
		[
			id,
			name,
			type,
			email.toLowerCase(),
			fixturePassword
		]
	);

	return id;
}

async function ensureUserByEmail(
	client,
	{ name, email, type }
) {
	const normalizedEmail =
		email.toLowerCase();

	const id = uuidFromFixture(
		'user-email',
		normalizedEmail
	);

	await upsertUser(client, {
		id,
		name,
		email: normalizedEmail,
		type
	});

	return id;
}

/* -------------------------------------------------------------------------- */
/* Fixture authentication sessions                                            */
/* -------------------------------------------------------------------------- */

async function createFixtureSession(
	client,
	userId,
	label
) {
	if (!userId) {
		throw new Error(
			`Cannot create ${label} session: userId is missing`
		);
	}

	const rawToken = crypto
		.randomBytes(32)
		.toString('hex');

	const tokenHash = crypto
		.createHash('sha256')
		.update(rawToken)
		.digest('hex');

	const expiresAt = new Date(
		Date.now() +
			1000 * 60 * 60 * 24 * 30
	);

	/*
	 * Remove an old fixture session for this
	 * user so each seeded user has one current
	 * checker token.
	 */
	await client.query(
		`
		DELETE FROM sessions
		WHERE user_id = $1
		`,
		[userId]
	);

	await client.query(
		`
		INSERT INTO sessions
			(
				id,
				user_id,
				token_hash,
				expires_at,
				created_at
			)
		VALUES
			($1, $2, $3, $4, NOW())
		`,
		[
			crypto.randomUUID(),
			userId,
			tokenHash,
			expiresAt
		]
	);

	return rawToken;
}

/* -------------------------------------------------------------------------- */
/* Event                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertEvent(client) {
	const event = fixtures.event;

	const eventId = uuidFromFixture(
		'event',
		event.id
	);

	await client.query(
		`
		INSERT INTO events
			(
				id,
				name,
				min_team_size,
				max_team_size,
				submissions_close,
				status
			)
		VALUES
			(
				$1,
				$2,
				$3,
				$4,
				$5,
				'live'
			)
		ON CONFLICT (id) DO UPDATE SET
			name = EXCLUDED.name,
			min_team_size = EXCLUDED.min_team_size,
			max_team_size = EXCLUDED.max_team_size,
			submissions_close = EXCLUDED.submissions_close,
			status = EXCLUDED.status
		`,
		[
			eventId,
			event.name,

			/*
			 * fixtures.json does not define event
			 * team-size limits.
			 *
			 * Fixture teams contain between 1 and 4
			 * members, so these satisfy the schema.
			 */
			1,
			4,

			event.submissions_close ?? null
		]
	);

	return eventId;
}

/* -------------------------------------------------------------------------- */
/* Tracks                                                                     */
/* -------------------------------------------------------------------------- */

async function upsertTrack(
	client,
	track,
	eventId
) {
	const trackId = uuidFromFixture(
		'track',
		track.id
	);

	await client.query(
		`
		INSERT INTO tracks
			(
				id,
				event_id,
				name,
				description
			)
		VALUES
			($1, $2, $3, $4)
		ON CONFLICT (id) DO UPDATE SET
			event_id = EXCLUDED.event_id,
			name = EXCLUDED.name,
			description = EXCLUDED.description
		`,
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
	memberUserIds,
	teamNames
) {
	const teamId = uuidFromFixture(
		'team',
		team.id
	);

	const leaderEmail =
		team.members[0]?.toLowerCase() ??
		null;

	/*
	 * This lookup is by team ID.
	 *
	 * Duplicate names do not collide.
	 */
	const databaseTeamName =
		teamNames.get(team.id) ??
		team.name;

	await client.query(
		`
		INSERT INTO teams
			(
				id,
				event_id,
				team_name,
				leader_email
			)
		VALUES
			($1, $2, $3, $4)
		ON CONFLICT (id) DO UPDATE SET
			event_id = EXCLUDED.event_id,
			team_name = EXCLUDED.team_name,
			leader_email = EXCLUDED.leader_email
		`,
		[
			teamId,
			eventId,
			databaseTeamName,
			leaderEmail
		]
	);

	for (
		const [index, email]
		of team.members.entries()
	) {
		const userId =
			memberUserIds[index];

		const normalizedEmail =
			email.toLowerCase();

		const existing =
			await client.query(
				`
				SELECT id
				FROM team_members
				WHERE team_id = $1
				  AND user_email = $2
				LIMIT 1
				`,
				[
					teamId,
					normalizedEmail
				]
			);

		if (existing.rowCount === 0) {
			await client.query(
				`
				INSERT INTO team_members
					(
						id,
						team_id,
						joined_at,
						user_email
					)
				VALUES
					(
						$1,
						$2,
						CURRENT_TIMESTAMP,
						$3
					)
				`,
				[
					crypto.randomUUID(),
					teamId,
					normalizedEmail
				]
			);
		}

		/*
		 * The user has already been created above.
		 */
		void userId;
	}

	return teamId;
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

async function upsertProject(
	client,
	project,
	teamIds,
	trackIds,
	projectIds
) {
	const projectId = uuidFromFixture(
		'project',
		project.id
	);

	const teamId =
		teamIds.get(project.team);

	const trackId =
		trackIds.get(project.track);

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

	/*
	 * The effective project is the latest submission.
	 *
	 * Delete any other project for this team before
	 * inserting/updating the effective project.
	 *
	 * This is keyed by team_id, never team_name.
	 */
	await client.query(
		`
		DELETE FROM projects
		WHERE team_id = $1
		  AND id <> $2
		`,
		[
			teamId,
			projectId
		]
	);

	await client.query(
		`
		INSERT INTO projects
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
			submitted_at = EXCLUDED.submitted_at
		`,
		[
			projectId,
			teamId,
			trackId,
			project.title,
			project.summary ?? null,
			normalizeRepoUrl(
				project.repo_url
			),
			project.submitted_at ?? null
		]
	);

	projectIds.set(
		project.id,
		projectId
	);

	return projectId;
}

/* -------------------------------------------------------------------------- */
/* Rubric                                                                      */
/* -------------------------------------------------------------------------- */

async function upsertRubricCriteria(
	client,
	eventId
) {
	const criterionIds = new Map();

	for (const name of [
		'functionality',
		'quality',
		'innovation'
	]) {
		const criterionId =
			uuidFromFixture(
				`criterion:${eventId}`,
				name
			);

		criterionIds.set(
			name,
			criterionId
		);

		await client.query(
			`
			INSERT INTO rubric_criteria
				(
					id,
					event_id,
					name,
					weight,
					max_score
				)
			VALUES
				($1, $2, $3, 1, 10)
			ON CONFLICT (id) DO UPDATE SET
				event_id = EXCLUDED.event_id,
				name = EXCLUDED.name,
				weight = EXCLUDED.weight,
				max_score = EXCLUDED.max_score
			`,
			[
				criterionId,
				eventId,
				name
			]
		);
	}

	return criterionIds;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
	const client =
		await pool.connect();

	try {
		await client.query('BEGIN');

		/* ------------------------------------------------------------------ */
		/* Event                                                               */
		/* ------------------------------------------------------------------ */

		const eventId =
			await upsertEvent(client);

		const trackIds = new Map();
		const judgeIds = new Map();
		const teamIds = new Map();
		const projectIds = new Map();

		/* ------------------------------------------------------------------ */
		/* Team names                                                          */
		/* ------------------------------------------------------------------ */

		const teamNames =
			buildTeamNames(
				fixtures.teams
			);

		/* ------------------------------------------------------------------ */
		/* Latest project per TEAM                                             */
		/* ------------------------------------------------------------------ */

		const latestByTeam =
			buildLatestProjects(
				fixtures.projects
			);

		/* ------------------------------------------------------------------ */
		/* Tracks                                                              */
		/* ------------------------------------------------------------------ */

		for (
			const track of fixtures.tracks
		) {
			trackIds.set(
				track.id,
				await upsertTrack(
					client,
					track,
					eventId
				)
			);
		}

		/* ------------------------------------------------------------------ */
		/* Judges                                                              */
		/* ------------------------------------------------------------------ */

		for (
			const judge of fixtures.judges
		) {
			const userId =
				await upsertUser(
					client,
					{
						id: uuidFromFixture(
							'user',
							judge.id
						),
						name: judge.name,
						email: judge.email,
						type: 'judge'
					}
				);

			/*
			 * Fixture judge ID -> actual DB user UUID
			 */
			judgeIds.set(
				judge.id,
				userId
			);

			for (
				const trackKey of judge.tracks
			) {
				const trackId =
					trackIds.get(
						trackKey
					);

				if (!trackId) {
					throw new Error(
						`Missing track ${trackKey} for judge ${judge.id}`
					);
				}

				await client.query(
					`
					INSERT INTO judge_track_eligibility
						(
							judge_id,
							track_id
						)
					VALUES
						($1, $2)
					ON CONFLICT
						(judge_id, track_id)
					DO NOTHING
					`,
					[
						userId,
						trackId
					]
				);
			}
		}

		/* ------------------------------------------------------------------ */
		/* Teams and participants                                             */
		/* ------------------------------------------------------------------ */

		let participantId = null;

		for (
			const team of fixtures.teams
		) {
			const memberUserIds = [];

			for (
				const email of team.members
			) {
				const userId =
					await ensureUserByEmail(
						client,
						{
							name: emailName(
								email
							),
							email,
							type: 'participant'
						}
					);

				memberUserIds.push(
					userId
				);

				if (!participantId) {
					participantId =
						userId;
				}
			}

			const teamId =
				await upsertTeam(
					client,
					team,
					eventId,
					memberUserIds,
					teamNames
				);

			/*
			 * IMPORTANT:
			 *
			 * team.id is the key.
			 * team.name is never used as identity.
			 */
			teamIds.set(
				team.id,
				teamId
			);
		}

		/* ------------------------------------------------------------------ */
		/* Projects                                                            */
		/* ------------------------------------------------------------------ */

		/*
		 * Only the latest project for each team survives.
		 *
		 * In particular:
		 *
		 * tm_07
		 *   prj_07 -> older
		 *   prj_41 -> later
		 *
		 * => prj_41 is inserted.
		 */
		for (
			const project
			of latestByTeam.values()
		) {
			await upsertProject(
				client,
				project,
				teamIds,
				trackIds,
				projectIds
			);
		}

		/* ------------------------------------------------------------------ */
		/* Rubric                                                             */
		/* ------------------------------------------------------------------ */

		const criterionIds =
			await upsertRubricCriteria(
				client,
				eventId
			);

		/* ------------------------------------------------------------------ */
		/* Scores and assignments                                             */
		/* ------------------------------------------------------------------ */

		/*
		 * IMPORTANT:
		 *
		 * Fixture score objects use:
		 *
		 *     score.judge
		 *     score.project
		 *     score.criteria
		 *
		 * There is no score.judge_id.
		 */
		const judgesWithFinalScores =
			new Set();

		let scoreEntriesProcessed = 0;
		let scoreEntriesSkipped = 0;

		for (
			const scoreEntry
			of fixtures.scores
		) {
			const judgeId =
				judgeIds.get(
					scoreEntry.judge
				);

			if (!judgeId) {
				throw new Error(
					`Missing judge mapping for ${scoreEntry.judge}`
				);
			}

			/*
			 * If the project isn't in projectIds,
			 * it was an obsolete historical submission.
			 *
			 * For tm_07, this means prj_07 is skipped
			 * and prj_41 is retained.
			 */
			const projectId =
				projectIds.get(
					scoreEntry.project
				);

			if (!projectId) {
				scoreEntriesSkipped += 1;
				continue;
			}

			judgesWithFinalScores.add(
				scoreEntry.judge
			);

			const assignmentId =
				uuidFromFixture(
					'judge-assignment',
					`${scoreEntry.judge}:${scoreEntry.project}`
				);

			await client.query(
				`
				INSERT INTO judge_assignments
					(
						id,
						judge_id,
						project_id,
						comment
					)
				VALUES
					($1, $2, $3, $4)
				ON CONFLICT
					(judge_id, project_id)
				DO UPDATE SET
					comment = EXCLUDED.comment
				`,
				[
					assignmentId,
					judgeId,
					projectId,
					scoreEntry.comment ??
						null
				]
			);

			for (
				const [
					criterionName,
					value
				]
				of Object.entries(
					scoreEntry.criteria ?? {}
				)
			) {
				const criterionId =
					criterionIds.get(
						criterionName
					);

				if (!criterionId) {
					throw new Error(
						`Unknown criterion: ${criterionName}`
					);
				}

				const scoreId =
					uuidFromFixture(
						'score',
						`${scoreEntry.judge}:${scoreEntry.project}:${criterionName}`
					);

				await client.query(
					`
					INSERT INTO scores
						(
							id,
							judge_assignment_id,
							criterion_id,
							score
						)
					VALUES
						($1, $2, $3, $4)
					ON CONFLICT
						(
							judge_assignment_id,
							criterion_id
						)
					DO UPDATE SET
						score = EXCLUDED.score
					`,
					[
						scoreId,
						assignmentId,
						criterionId,
						value
					]
				);
			}

			scoreEntriesProcessed += 1;
		}

		/* ------------------------------------------------------------------ */
		/* Organizer                                                           */
		/* ------------------------------------------------------------------ */

		const organizerId =
			await upsertUser(
				client,
				{
					id: uuidFromFixture(
						'user',
						'fixture-organizer'
					),
					name: 'Fixture Organizer',
					email: 'organizer@dogfood.test',
					type: 'organizer'
				}
			);

		/* ------------------------------------------------------------------ */
		/* Select checker judges                                               */
		/* ------------------------------------------------------------------ */

		/*
		 * The checker calls these judge_a and judge_b.
		 *
		 * They are aliases in .dogfood.toml; they do not
		 * need to exist as fixture IDs.
		 *
		 * Choose two fixture judges who actually have
		 * scores for retained projects.
		 */
		const checkerJudgeFixtureIds = [
			...judgesWithFinalScores
		];

		if (
			checkerJudgeFixtureIds.length < 2
		) {
			throw new Error(
				'Need at least two fixture judges with scores on retained projects'
			);
		}

		const judgeAFixtureId =
			checkerJudgeFixtureIds[0];

		const judgeBFixtureId =
			checkerJudgeFixtureIds[1];

		const judgeAId =
			judgeIds.get(
				judgeAFixtureId
			);

		const judgeBId =
			judgeIds.get(
				judgeBFixtureId
			);

		if (!judgeAId) {
			throw new Error(
				`Could not resolve judge_a: ${judgeAFixtureId}`
			);
		}

		if (!judgeBId) {
			throw new Error(
				`Could not resolve judge_b: ${judgeBFixtureId}`
			);
		}

		if (!participantId) {
			throw new Error(
				'No participant user was created'
			);
		}

		/* ------------------------------------------------------------------ */
		/* Checker sessions                                                    */
		/* ------------------------------------------------------------------ */

		const organizerToken =
			await createFixtureSession(
				client,
				organizerId,
				'organizer'
			);

		const judgeAToken =
			await createFixtureSession(
				client,
				judgeAId,
				'judge_a'
			);

		const judgeBToken =
			await createFixtureSession(
				client,
				judgeBId,
				'judge_b'
			);

		const participantToken =
			await createFixtureSession(
				client,
				participantId,
				'participant'
			);

		/* ------------------------------------------------------------------ */
		/* Commit                                                              */
		/* ------------------------------------------------------------------ */

		await client.query(
			'COMMIT'
		);

		console.log('');
		console.log(
			'Fixture seed completed successfully.'
		);
		console.log('');

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
			`Effective projects seeded: ${latestByTeam.size}`
		);

		console.log(
			`Score entries processed: ${scoreEntriesProcessed}`
		);

		console.log(
			`Score entries skipped: ${scoreEntriesSkipped}`
		);

		console.log('');

		console.log(
			`tm_07 effective project: ${
				latestByTeam.get('tm_07')?.id ??
				'not found'
			}`
		);

		console.log('');

		console.log(
			`judge_a fixture: ${judgeAFixtureId}`
		);

		console.log(
			`judge_b fixture: ${judgeBFixtureId}`
		);

		console.log('');

		console.log(
			'Copy these four lines into .dogfood.toml:'
		);

		console.log('');

		console.log(
			'[auth]'
		);

		console.log(
			`organizer = "Cookie: session=${organizerToken}"`
		);

		console.log(
			`judge_a = "Cookie: session=${judgeAToken}"`
		);

		console.log(
			`judge_b = "Cookie: session=${judgeBToken}"`
		);

		console.log(
			`participant = "Cookie: session=${participantToken}"`
		);

		console.log('');
	} catch (error) {
		await client.query(
			'ROLLBACK'
		);

		throw error;
	} finally {
		client.release();
		await pool.end();
	}
}

main().catch((error) => {
	console.error(
		'Fixture seed failed.'
	);

	console.error(error);

	process.exit(1);
});