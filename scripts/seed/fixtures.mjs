import pg from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { promisify } from 'node:util';

const { Pool } = pg;
const scrypt = promisify(crypto.scrypt);

const ROOT = process.cwd();

const fixtureCandidates = [
	process.env.DOGFOOD_FIXTURES,
	path.join(ROOT, 'fixtures.json'),
	path.join(ROOT, 'data', 'fixtures.json'),
	path.join(ROOT, 'scripts', 'seed', 'fixtures.json')
].filter(Boolean);

const fixturePath = fixtureCandidates.find((file) => fs.existsSync(file));

if (!fixturePath) {
	throw new Error(
		[
			'Could not find fixtures.json.',
			'Looked in:',
			...fixtureCandidates.map((file) => `  ${file}`)
		].join('\n')
	);
}

const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

const DATABASE_URL =
	process.env.DATABASE_URL ||
	'postgresql://postgres:1234@localhost:5432/dogfood';

const pool = new Pool({
	connectionString: DATABASE_URL
});

function assertFixture(condition, message) {
	if (!condition) {
		throw new Error(`Invalid fixtures.json: ${message}`);
	}
}

function uuid() {
	return crypto.randomUUID();
}

function normalizeEmail(email) {
	return String(email).trim().toLowerCase();
}

async function hashPassword(password) {
	const salt = crypto.randomBytes(16).toString('hex');
	const derivedKey = await scrypt(password, salt, 64);

	return `scrypt:${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

function getMapValue(map, key, description) {
	const value = map.get(key);

	if (!value) {
		throw new Error(
			`Fixture references unknown ${description}: ${key}`
		);
	}

	return value;
}

/*
|--------------------------------------------------------------------------
| Validate fixture
|--------------------------------------------------------------------------
*/

assertFixture(fixtures.event, 'missing event');
assertFixture(fixtures.event.id, 'event.id is missing');
assertFixture(fixtures.event.name, 'event.name is missing');
assertFixture(
	fixtures.event.submissions_close,
	'event.submissions_close is missing'
);

assertFixture(
	Array.isArray(fixtures.tracks),
	'tracks must be an array'
);

assertFixture(
	Array.isArray(fixtures.judges),
	'judges must be an array'
);

assertFixture(
	Array.isArray(fixtures.teams),
	'teams must be an array'
);

assertFixture(
	Array.isArray(fixtures.projects),
	'projects must be an array'
);

assertFixture(
	Array.isArray(fixtures.scores),
	'scores must be an array'
);

assertFixture(
	fixtures.judges.length >= 3,
	'at least 3 fixture judges are required'
);

assertFixture(
	fixtures.teams.length > 0,
	'at least one fixture team is required'
);

assertFixture(
	fixtures.teams[0].members?.length > 0,
	'the first fixture team must have at least one member'
);

const submissionDeadline = new Date(
	fixtures.event.submissions_close
);

assertFixture(
	!Number.isNaN(submissionDeadline.getTime()),
	'event.submissions_close must be a valid ISO timestamp'
);

/*
|--------------------------------------------------------------------------
| The fixture has 41 project/submission records but 40 teams.
|
| A team may submit again before the deadline. The latest submission
| becomes the team's final project.
|
| Therefore we reduce:
|
|     41 fixture submissions
|             ↓
|     40 final project records
|
| We do NOT remove the UNIQUE(team_id) database constraint.
|--------------------------------------------------------------------------
*/

const projectsByTeam = new Map();

for (const project of fixtures.projects) {
	assertFixture(project.id, 'project.id is missing');
	assertFixture(project.team, `project ${project.id} has no team`);
	assertFixture(project.track, `project ${project.id} has no track`);
	assertFixture(project.title, `project ${project.id} has no title`);
	assertFixture(
		project.submitted_at,
		`project ${project.id} has no submitted_at`
	);

	if (!projectsByTeam.has(project.team)) {
		projectsByTeam.set(project.team, []);
	}

	projectsByTeam.get(project.team).push(project);
}

for (const submissions of projectsByTeam.values()) {
	submissions.sort(
		(a, b) =>
			new Date(a.submitted_at).getTime() -
			new Date(b.submitted_at).getTime()
		);
}

const finalProjects = [];

for (const [teamFixtureId, submissions] of projectsByTeam) {
	const finalSubmission = submissions[submissions.length - 1];

	finalProjects.push({
		teamFixtureId,
		submissions,
		finalSubmission
	});
}

console.log(
	`Fixture submissions: ${fixtures.projects.length}`
);

console.log(
	`Teams with submissions: ${finalProjects.length}`
);

console.log(
	`Duplicate/replacement submissions collapsed: ${
		fixtures.projects.length - finalProjects.length
	}`
);

const client = await pool.connect();

try {
	await client.query('BEGIN');

	console.log(`Using fixtures: ${fixturePath}`);
	console.log(
		`Event: ${fixtures.event.name} (${fixtures.event.id})`
	);

	/*
	|--------------------------------------------------------------------------
	| 1. Fixture identities
	|--------------------------------------------------------------------------
	|
	| The official fixture does not contain a separate organizer identity.
	|
	| The acceptance checker requires an organizer authentication header.
	| Therefore one existing fixture judge identity is assigned organizer
	| role, while the next two fixture judges are used as judge_a/judge_b.
	|
	| No dev accounts are introduced.
	|--------------------------------------------------------------------------
	*/

	const organizerFixture = fixtures.judges[0];
	const judgeAFixture = fixtures.judges[1];
	const judgeBFixture = fixtures.judges[2];

	assertFixture(
		organizerFixture.email,
		'judges[0].email is missing'
	);

	assertFixture(
		judgeAFixture.email,
		'judges[1].email is missing'
	);

	assertFixture(
		judgeBFixture.email,
		'judges[2].email is missing'
	);

	const participantEmail = normalizeEmail(
		fixtures.teams[0].members[0]
	);

	/*
	|--------------------------------------------------------------------------
	| 2. Collect fixture users
	|--------------------------------------------------------------------------
	*/

	const fixtureUsers = new Map();

	for (const judge of fixtures.judges) {
		assertFixture(
			judge.id,
			'judge.id is missing'
		);

		assertFixture(
			judge.email,
			`judge ${judge.id} has no email`
		);

		assertFixture(
			judge.name,
			`judge ${judge.id} has no name`
		);

		const email = normalizeEmail(judge.email);

		fixtureUsers.set(email, {
			name: judge.name,
			email,
			role:
				judge.id === organizerFixture.id
					? 'organizer'
					: 'judge'
		});
	}

	/*
	|--------------------------------------------------------------------------
	| Add fixture team members as participants
	|--------------------------------------------------------------------------
	*/

	for (const team of fixtures.teams) {
		assertFixture(
			team.id,
			'team.id is missing'
		);

		assertFixture(
			team.name,
			`team ${team.id} has no name`
		);

		assertFixture(
			Array.isArray(team.members),
			`team ${team.id} members must be an array`
		);

		for (const member of team.members) {
			const email = normalizeEmail(member);

			/*
			 * Do not overwrite judge identities if a fixture identity
			 * happens to occur in both places.
			 */
			if (!fixtureUsers.has(email)) {
				fixtureUsers.set(email, {
					name: email.split('@')[0],
					email,
					role: 'participant'
				});
			}
		}
	}

	/*
	|--------------------------------------------------------------------------
	| 3. Users
	|--------------------------------------------------------------------------
	*/

	const userIds = new Map();

	for (const user of fixtureUsers.values()) {
		const existing = await client.query(
			`
			SELECT id
			FROM users
			WHERE LOWER(email) = LOWER($1)
			LIMIT 1
			`,
			[user.email]
		);

		let userId;

		if (existing.rows.length > 0) {
			userId = existing.rows[0].id;

			await client.query(
				`
				UPDATE users
				SET
					name = $1,
					type = $2
				WHERE id = $3
				`,
				[
					user.name,
					user.role,
					userId
				]
			);
		} else {
			userId = uuid();

			/*
			 * fixtures.json has no password field.
			 *
			 * The checker does not log in; it receives session cookies
			 * generated below. The password exists only because the
			 * current users table requires one.
			 */
			const passwordHash = await hashPassword(
				`fixture-${user.email}`
			);

			await client.query(
				`
				INSERT INTO users (
					id,
					name,
					type,
					email,
					password,
					created_at
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					$5,
					NOW()
				)
				`,
				[
					userId,
					user.name,
					user.role,
					user.email,
					passwordHash
				]
			);
		}

		userIds.set(user.email, userId);
	}

	const organizerId = getMapValue(
		userIds,
		normalizeEmail(organizerFixture.email),
		'organizer fixture user'
	);

	const judgeAId = getMapValue(
		userIds,
		normalizeEmail(judgeAFixture.email),
		'judge A fixture user'
	);

	const judgeBId = getMapValue(
		userIds,
		normalizeEmail(judgeBFixture.email),
		'judge B fixture user'
	);

	const participantId = getMapValue(
		userIds,
		participantEmail,
		'participant fixture user'
	);

	/*
	|--------------------------------------------------------------------------
	| 4. Event
	|--------------------------------------------------------------------------
	*/

	let eventId;

	const existingEvent = await client.query(
		`
		SELECT id
		FROM events
		WHERE id::text = $1
		   OR name = $2
		LIMIT 1
		`,
		[
			fixtures.event.id,
			fixtures.event.name
		]
	);

	if (existingEvent.rows.length > 0) {
		eventId = existingEvent.rows[0].id;

		await client.query(
			`
			UPDATE events
			SET
				name = $1,
				organizer_id = $2,
				status = 'live',
				application_close_at = $3
			WHERE id = $4
			`,
			[
				fixtures.event.name,
				organizerId,
				submissionDeadline,
				eventId
			]
		);
	} else {
		eventId = uuid();

		await client.query(
			`
			INSERT INTO events (
				id,
				name,
				tagline,
				about,
				min_team_size,
				max_team_size,
				organizer_id,
				status,
				application_close_at,
				created_at
			)
			VALUES (
				$1,
				$2,
				$3,
				$4,
				$5,
				$6,
				$7,
				'live',
				$8,
				NOW()
			)
			`,
			[
				eventId,
				fixtures.event.name,
				'DOGFOOD 2026 fixture event',
				'Seeded from the official DOGFOOD fixture dataset.',
				1,
				10,
				organizerId,
				submissionDeadline
			]
		);
	}

	/*
	|--------------------------------------------------------------------------
	| 5. Tracks
	|--------------------------------------------------------------------------
	*/

	const trackIds = new Map();

	for (const track of fixtures.tracks) {
		assertFixture(
			track.id,
			'track.id is missing'
		);

		assertFixture(
			track.name,
			`track ${track.id} has no name`
		);

		let trackId;

		const existing = await client.query(
			`
			SELECT id
			FROM tracks
			WHERE event_id = $1
			  AND name = $2
			LIMIT 1
			`,
			[
				eventId,
				track.name
			]
		);

		if (existing.rows.length > 0) {
			trackId = existing.rows[0].id;
		} else {
			trackId = uuid();

			await client.query(
				`
				INSERT INTO tracks (
					id,
					event_id,
					name,
					description,
					created_at
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					NOW()
				)
				`,
				[
					trackId,
					eventId,
					track.name,
					`Fixture track ${track.id}`
				]
			);
		}

		trackIds.set(track.id, trackId);
	}

	/*
	|--------------------------------------------------------------------------
	| 6. Submission forms + stages
	|--------------------------------------------------------------------------
	*/

	const stageIds = new Map();

	for (const track of fixtures.tracks) {
		const trackId = getMapValue(
			trackIds,
			track.id,
			'track'
		);

		const formName =
			`Fixture Submission Form - ${track.name}`;

		let formId;

		const existingForm = await client.query(
			`
			SELECT id
			FROM submission_forms
			WHERE name = $1
			LIMIT 1
			`,
			[formName]
		);

		if (existingForm.rows.length > 0) {
			formId = existingForm.rows[0].id;
		} else {
			formId = uuid();

			await client.query(
				`
				INSERT INTO submission_forms (
					id,
					name,
					created_at
				)
				VALUES (
					$1,
					$2,
					NOW()
				)
				`,
				[
					formId,
					formName
				]
			);
		}

		const stageName =
			`Fixture Submission - ${track.name}`;

		let stageId;

		const existingStage = await client.query(
			`
			SELECT id
			FROM stages
			WHERE track_id = $1
			  AND name = $2
			LIMIT 1
			`,
			[
				trackId,
				stageName
			]
		);

		if (existingStage.rows.length > 0) {
			stageId = existingStage.rows[0].id;

			await client.query(
				`
				UPDATE stages
				SET
					form_id = $1,
					end_at = $2
				WHERE id = $3
				`,
				[
					formId,
					submissionDeadline,
					stageId
				]
			);
		} else {
			stageId = uuid();

			await client.query(
				`
				INSERT INTO stages (
					id,
					track_id,
					form_id,
					name,
					description,
					start_at,
					end_at,
					created_at
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					$7,
					NOW()
				)
				`,
				[
					stageId,
					trackId,
					formId,
					stageName,
					'Fixture submission stage.',
					new Date('2026-02-01T00:00:00Z'),
					submissionDeadline
				]
			);
		}

		stageIds.set(track.id, stageId);
	}

	/*
	|--------------------------------------------------------------------------
	| 7. Teams
	|--------------------------------------------------------------------------
	*/

	const teamIds = new Map();

	for (const team of fixtures.teams) {
		const memberEmails = team.members.map(
			normalizeEmail
		);

		assertFixture(
			memberEmails.length > 0,
			`team ${team.id} has no members`
		);

		const leaderEmail = memberEmails[0];

		getMapValue(
			userIds,
			leaderEmail,
			`team member ${leaderEmail}`
		);

		let teamId;

		const existing = await client.query(
			`
			SELECT id
			FROM teams
			WHERE event_id = $1
			  AND team_name = $2
			LIMIT 1
			`,
			[
				eventId,
				team.name
			]
		);

		if (existing.rows.length > 0) {
			teamId = existing.rows[0].id;

			await client.query(
				`
				UPDATE teams
				SET leader_email = $1
				WHERE id = $2
				`,
				[
					leaderEmail,
					teamId
				]
			);
		} else {
			teamId = uuid();

			await client.query(
				`
				INSERT INTO teams (
					id,
					event_id,
					team_name,
					leader_email,
					created_at
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					NOW()
				)
				`,
				[
					teamId,
					eventId,
					team.name,
					leaderEmail
				]
			);
		}

		teamIds.set(team.id, teamId);

		/*
		 * Rebuild team membership from fixture.
		 */

		await client.query(
			`
			DELETE FROM team_members
			WHERE team_id = $1
			`,
			[teamId]
		);

		for (const email of memberEmails) {
			await client.query(
				`
				INSERT INTO team_members (
					team_id,
					user_email,
					joined_at
				)
				VALUES (
					$1,
					$2,
					NOW()
				)
				ON CONFLICT DO NOTHING
				`,
				[
					teamId,
					email
				]
			);
		}

		/*
		 * Give every team the first stage as its current stage.
		 * This is only fixture setup; the project itself determines
		 * its actual submission stage.
		 */
		const firstTrack = fixtures.tracks[0];

		if (firstTrack) {
			const firstStageId = stageIds.get(
				firstTrack.id
			);

			if (firstStageId) {
				await client.query(
					`
					UPDATE teams
					SET current_stage_id = $1
					WHERE id = $2
					`,
					[
						firstStageId,
						teamId
					]
				);
			}
		}
	}

	/*
	|--------------------------------------------------------------------------
	| 8. FINAL PROJECT PER TEAM
	|--------------------------------------------------------------------------
	|
	| This is the important part.
	|
	| We NEVER insert more than one project for a team.
	|
	| If a team has:
	|
	|   prj_12 submitted at 18:00
	|   prj_12b submitted at 21:00
	|
	| only the 21:00 version is stored as the current project.
	|--------------------------------------------------------------------------
	*/

	let finalProjectCount = 0;
	let replacementCount = 0;

	for (const record of finalProjects) {
		const {
			teamFixtureId,
			submissions,
			finalSubmission
		} = record;

		const teamId = getMapValue(
			teamIds,
			teamFixtureId,
			'team'
		);

		const trackId = getMapValue(
			trackIds,
			finalSubmission.track,
			'track'
		);

		const stageId = getMapValue(
			stageIds,
			finalSubmission.track,
			'stage'
		);

		/*
		 * Check whether this team already has its single project row.
		 */

		const existing = await client.query(
			`
			SELECT id
			FROM projects
			WHERE team_id = $1
			LIMIT 1
			`,
			[teamId]
		);

		const projectTagline =
			finalSubmission.summary || null;

		const longDescription =
			finalSubmission.description ||
			finalSubmission.summary ||
			null;

		const repoUrl =
			finalSubmission.repo_url || null;

		const submittedAt =
			finalSubmission.submitted_at
				? new Date(finalSubmission.submitted_at)
				: null;

		if (existing.rows.length > 0) {
			await client.query(
				`
				UPDATE projects
				SET
					stage_id = $1,
					track_id = $2,
					project_name = $3,
					project_tagline = $4,
					long_description = $5,
					repo_url = $6,
					status = 'submitted',
					submitted_at = $7
				WHERE id = $8
				`,
				[
					stageId,
					trackId,
					finalSubmission.title,
					projectTagline,
					longDescription,
					repoUrl,
					submittedAt,
					existing.rows[0].id
				]
			);
		} else {
			await client.query(
				`
				INSERT INTO projects (
					id,
					team_id,
					stage_id,
					track_id,
					project_name,
					project_tagline,
					long_description,
					repo_url,
					status,
					submitted_at
				)
				VALUES (
					$1,
					$2,
					$3,
					$4,
					$5,
					$6,
					$7,
					$8,
					'submitted',
					$9
				)
				`,
				[
					uuid(),
					teamId,
					stageId,
					trackId,
					finalSubmission.title,
					projectTagline,
					longDescription,
					repoUrl,
					submittedAt
				]
			);
		}

		finalProjectCount++;

		if (submissions.length > 1) {
			replacementCount += submissions.length - 1;

			console.log(
				`Replacement submission: ${teamFixtureId} -> ${finalSubmission.id}`
			);
			console.log(
				`  kept: ${finalSubmission.title}`
			);
			console.log(
				`  submitted: ${finalSubmission.submitted_at}`
			);
		}
	}

	/*
	|--------------------------------------------------------------------------
	| 9. Sessions
	|--------------------------------------------------------------------------
	*/

	async function createSession(userId, label) {
		const rawToken =
			crypto.randomBytes(32).toString('hex');

		const tokenHash =
			crypto
				.createHash('sha256')
				.update(rawToken)
				.digest('hex');

		const expiresAt = new Date(
			Date.now() +
				1000 * 60 * 60 * 24 * 30
		);

		await client.query(
			`
			DELETE FROM sessions
			WHERE user_id = $1
			`,
			[userId]
		);

		await client.query(
			`
			INSERT INTO sessions (
				id,
				user_id,
				token_hash,
				expires_at,
				created_at
			)
			VALUES (
				$1,
				$2,
				$3,
				$4,
				NOW()
			)
			`,
			[
				uuid(),
				userId,
				tokenHash,
				expiresAt
			]
		);

		console.log(
			`${label}=Cookie: session=${rawToken}`
		);
	}

	console.log('\n=== DOGFOOD FIXTURE AUTH ===');

	await createSession(
		organizerId,
		'organizer'
	);

	await createSession(
		judgeAId,
		'judge_a'
	);

	await createSession(
		judgeBId,
		'judge_b'
	);

	await createSession(
		participantId,
		'participant'
	);

	/*
	|--------------------------------------------------------------------------
	| 10. Scores
	|--------------------------------------------------------------------------
	|
	| The fixture contains scores, but the current application schema does
	| not yet contain judging/score tables.
	|
	| Do not invent a score table here.
	|--------------------------------------------------------------------------
	*/

	console.log(
		`\nFixture score records: ${fixtures.scores.length}`
	);

	console.log(
		'Scores not inserted: current schema has no judging/score tables.'
	);

	/*
	|--------------------------------------------------------------------------
	| 11. Commit
	|--------------------------------------------------------------------------
	*/

	await client.query('COMMIT');

	console.log('\n=== FIXTURE SEED COMPLETE ===');

	console.log(
		`Event:                    ${fixtures.event.name}`
	);

	console.log(
		`Tracks:                   ${fixtures.tracks.length}`
	);

	console.log(
		`Fixture judges:           ${fixtures.judges.length}`
	);

	console.log(
		`Teams:                    ${fixtures.teams.length}`
	);

	console.log(
		`Fixture submissions:      ${fixtures.projects.length}`
	);

	console.log(
		`Final project records:    ${finalProjectCount}`
	);

	console.log(
		`Replacement submissions:  ${replacementCount}`
	);

	console.log(
		`Fixture scores:            ${fixtures.scores.length}`
	);

	console.log(
		`Submission deadline:      ${submissionDeadline.toISOString()}`
	);

	console.log(
		'\nCopy the four printed authentication lines into .dogfood.toml.'
	);

} catch (error) {
	await client.query('ROLLBACK');

	console.error('\nFixture seeding failed.');
	console.error(error);

	process.exitCode = 1;
} finally {
	client.release();
	await pool.end();
}