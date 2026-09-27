import {
	pgEnum,
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	boolean,
	integer,
	index,
	uniqueIndex
} from 'drizzle-orm/pg-core';

export const userType = pgEnum('user_type', [
	'admin',
	'organizer',
	'participant',
	'judge',
	'visitor'
]);

export const questionType = pgEnum('question_type', [
	'text',
	'textarea',
	'number',
	'select',
	'radio',
	'checkbox'
]);

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		name: varchar('name', { length: 150 }).notNull(),
		type: userType('type').notNull(),
		email: varchar('email', { length: 255 }),
		password: varchar('password', { length: 255 }).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow().notNull()
	},
	(table) => ({
		emailUnique: uniqueIndex('users_email_unique_idx').on(table.email),
	})
);

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		tokenHash: varchar('token_hash', { length: 128 }).notNull(),
		expiresAt: timestamp('expires_at', {
			withTimezone: true
		}).notNull(),
		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow()
		.notNull()
	},
	(table) => ({
		tokenUnique: uniqueIndex('sessions_token_hash_unique_idx').on(
			table.tokenHash
		),
		userIndex: index('sessions_user_id_idx').on(table.userId),
		expiresIndex: index('sessions_expires_at_idx').on(table.expiresAt)
	})
);

export const events = pgTable(
	'events',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		name: varchar('name', { length: 200 }).notNull(),

		tagline: varchar('tagline', { length: 500 }),

		about: text('about'),

		minTeamSize: integer('min_team_size').notNull(),

		maxTeamSize: integer('max_team_size').notNull(),

		websiteLink: text('website_link'),

		contactEmail: varchar('contact_email', { length: 255 }),

		logo: text('logo'),

		applicationOpenAt: timestamp('application_open_at', {
			withTimezone: true
		}),

		applicationCloseAt: timestamp('application_close_at', {
			withTimezone: true
		}),

		judgingStartAt: timestamp('judging_start_at', {
			withTimezone: true
		}),

		judgingDeadline: timestamp('judging_deadline', {
			withTimezone: true
		}),

		resultAnnouncement: timestamp('result_announcement', {
			withTimezone: true
		}),

		prizes: text('prizes'),

		organizerId: uuid('organizer_id').references(() => users.id, {
			onDelete: 'restrict'
		}),

		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow().notNull()
	},
	(table) => ({
		organizerIndex: index('events_organizer_id_idx').on(table.organizerId)
	})
);

export const tracks = pgTable(
	'tracks',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),

		name: varchar('name', { length: 200 }).notNull(),

		description: text('description'),

		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow().notNull()
	},
	(table) => ({
		eventIndex: index('tracks_event_id_idx').on(table.eventId)
	})
);

export const submissionForms = pgTable('submission_forms', {
	id: uuid('id').defaultRandom().primaryKey(),

	name: varchar('name', { length: 200 }).notNull(),

	createdAt: timestamp('created_at', {
		withTimezone: true
	}).defaultNow().notNull()
});

export const stages = pgTable(
	'stages',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		trackId: uuid('track_id')
			.notNull()
			.references(() => tracks.id, { onDelete: 'cascade' }),

		formId: uuid('form_id')
			.notNull()
			.references(() => submissionForms.id, { onDelete: 'restrict' }),

		name: varchar('name', { length: 200 }).notNull(),

		description: text('description'),

		startAt: timestamp('start_at', {
			withTimezone: true
		}),

		endAt: timestamp('end_at', {
			withTimezone: true
		}),

		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow().notNull()
	},
	(table) => ({
		trackIndex: index('stages_track_id_idx').on(table.trackId),
		formIndex: index('stages_form_id_idx').on(table.formId)
	})
);

export const teams = pgTable(
	'teams',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, { onDelete: 'cascade' }),

		teamName: varchar('team_name', { length: 200 }).notNull(),

		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow().notNull(),

		leaderEmail: varchar('leader_email', { length: 255 }).references(
			() => users.email
		)
	},
	(table) => ({
		eventIndex: index('teams_event_id_idx').on(table.eventId),
		teamNameUnique: uniqueIndex('teams_event_name_unique_idx').on(
			table.eventId,
			table.teamName
		)
	})
);

export const teamMembers = pgTable(
	'team_members',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'cascade' }),

		joinedAt: timestamp('joined_at', {
			withTimezone: true
		}).defaultNow().notNull(),

		userEmail: varchar('user_email', { length: 255 }).references(
			() => users.email
		)
	},
	(table) => ({
		teamIndex: index('team_members_team_id_idx').on(table.teamId)
	})
);

export const teamInvites = pgTable(
	'team_invites',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'cascade' }),

		tokenHash: varchar('token_hash', { length: 128 }).notNull(),

		expiresAt: timestamp('expires_at', {
			withTimezone: true
		}),

		createdAt: timestamp('created_at', {
			withTimezone: true
		}).defaultNow().notNull()
	},
	(table) => ({
		tokenUnique: uniqueIndex('team_invites_token_hash_unique_idx').on(
			table.tokenHash
		),
		teamIndex: index('team_invites_team_id_idx').on(table.teamId),
		expiresIndex: index('team_invites_expires_at_idx').on(table.expiresAt)
	})
);

export const projects = pgTable(
	'projects',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.id, { onDelete: 'cascade' }),

		stageId: uuid('stage_id')
			.notNull()
			.references(() => stages.id, { onDelete: 'restrict' }),

		projectName: varchar('project_name', { length: 200 }).notNull(),

		projectTagline: varchar('project_tagline', { length: 500 }),

		longDescription: text('long_description').notNull(),

		thumbnail: text('thumbnail'),

		imageGallery: text('image_gallery').array(),

		demoVideoUrl: text('demo_video_url'),

		repoUrl: text('repo_url'),

		deployedLiveLink: text('deployed_live_link'),

		techTags: text('tech_tags').array(),

		status: varchar('status', { length: 20 })
			.notNull()
			.default('draft'),

		submittedAt: timestamp('submitted_at', {
			withTimezone: true
		}).defaultNow().notNull()
	},
	(table) => ({
		teamIndex: index('projects_team_id_idx').on(table.teamId),
		stageIndex: index('projects_stage_id_idx').on(table.stageId),
		statusIndex: index('projects_status_idx').on(table.status)
	})
);