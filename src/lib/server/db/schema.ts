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

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

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

export const eventStatusEnum = pgEnum('event_status', [
	'draft',
	'live'
]);

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
	'users',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		name: varchar('name', {
			length: 150
		}).notNull(),

		type: userType('type').notNull(),

		email: varchar('email', {
			length: 255
		}),

		password: varchar('password', {
			length: 255
		}).notNull(),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		emailUnique: uniqueIndex(
			'users_email_unique_idx'
		).on(table.email)
	})
);

/* -------------------------------------------------------------------------- */
/* Sessions                                                                   */
/* -------------------------------------------------------------------------- */

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),

		tokenHash: varchar('token_hash', {
			length: 128
		}).notNull(),

		expiresAt: timestamp('expires_at', {
			withTimezone: true
		}).notNull(),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		tokenUnique: uniqueIndex(
			'sessions_token_hash_unique_idx'
		).on(table.tokenHash),

		userIndex: index(
			'sessions_user_id_idx'
		).on(table.userId),

		expiresIndex: index(
			'sessions_expires_at_idx'
		).on(table.expiresAt)
	})
);

/* -------------------------------------------------------------------------- */
/* Events                                                                     */
/* -------------------------------------------------------------------------- */

export const events = pgTable(
	'events',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		name: varchar('name', {
			length: 200
		}).notNull(),

		tagline: varchar('tagline', {
			length: 500
		}),

		about: text('about'),

		minTeamSize: integer('min_team_size').notNull(),

		maxTeamSize: integer('max_team_size').notNull(),

		websiteLink: text('website_link'),

		contactEmail: varchar('contact_email', {
			length: 255
		}),

		logo: text('logo'),

		applicationOpenAt: timestamp('application_open_at', {
			withTimezone: true
		}),

		applicationCloseAt: timestamp('application_close_at', {
			withTimezone: true
		}),

		submissionsClose: timestamp('submissions_close', {
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

		organizerId: uuid('organizer_id').references(
			() => users.id,
			{
				onDelete: 'restrict'
			}
		),

		status: eventStatusEnum('status')
			.notNull()
			.default('draft'),

		publishedAt: timestamp('published_at', {
			withTimezone: true
		}),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		organizerIndex: index(
			'events_organizer_id_idx'
		).on(table.organizerId),

		statusIndex: index(
			'events_status_idx'
		).on(table.status)
	})
);

/* -------------------------------------------------------------------------- */
/* Tracks                                                                     */
/* -------------------------------------------------------------------------- */

export const tracks = pgTable(
	'tracks',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, {
				onDelete: 'cascade'
			}),

		name: varchar('name', {
			length: 200
		}).notNull(),

		description: text('description'),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		eventIndex: index(
			'tracks_event_id_idx'
		).on(table.eventId),

		eventNameUnique: uniqueIndex(
			'tracks_event_name_unique_idx'
		).on(
			table.eventId,
			table.name
		)
	})
);

/* -------------------------------------------------------------------------- */
/* Submission Forms                                                           */
/* -------------------------------------------------------------------------- */

export const submissionForms = pgTable(
	'submission_forms',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, {
				onDelete: 'cascade'
			}),

		name: varchar('name', {
			length: 200
		}).notNull(),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		eventIdIndex: index(
			'submission_forms_event_id_idx'
		).on(table.eventId)
	})
);

/* -------------------------------------------------------------------------- */
/* Custom Questions                                                           */
/* -------------------------------------------------------------------------- */

export const customQuestions = pgTable(
	'custom_questions',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		formId: uuid('form_id')
			.notNull()
			.references(() => submissionForms.id, {
				onDelete: 'cascade'
			}),

		question: text('question').notNull(),

		questionType: questionType(
			'question_type'
		).notNull(),

		required: boolean('required')
			.notNull()
			.default(false),

		options: text('options').array(),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		formIndex: index(
			'custom_questions_form_id_idx'
		).on(table.formId)
	})
);

/* -------------------------------------------------------------------------- */
/* Teams                                                                      */
/* -------------------------------------------------------------------------- */

export const teams = pgTable(
	'teams',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, {
				onDelete: 'cascade'
			}),

		teamName: varchar('team_name', {
			length: 200
		}).notNull(),

		leaderEmail: varchar('leader_email', {
			length: 255
		}).references(() => users.email),

		leaderMobileNumber: varchar(
			'leader_mobile_number',
			{
				length: 20
			}
		),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		eventIndex: index(
			'teams_event_id_idx'
		).on(table.eventId),

		teamNameUnique: uniqueIndex(
			'teams_event_name_unique_idx'
		).on(
			table.eventId,
			table.teamName
		)
	})
);

/* -------------------------------------------------------------------------- */
/* Team Members                                                               */
/* -------------------------------------------------------------------------- */

export const teamMembers = pgTable(
	'team_members',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.id, {
				onDelete: 'cascade'
			}),

		joinedAt: timestamp('joined_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull(),

		userEmail: varchar('user_email', {
			length: 255
		}).references(() => users.email)
	},
	(table) => ({
		teamIndex: index(
			'team_members_team_id_idx'
		).on(table.teamId)
	})
);

/* -------------------------------------------------------------------------- */
/* Team Invites                                                               */
/* -------------------------------------------------------------------------- */

export const teamInvites = pgTable(
	'team_invites',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.id, {
				onDelete: 'cascade'
			}),

		tokenHash: varchar('token_hash', {
			length: 128
		}).notNull(),

		expiresAt: timestamp('expires_at', {
			withTimezone: true
		}),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		tokenUnique: uniqueIndex(
			'team_invites_token_hash_unique_idx'
		).on(table.tokenHash),

		teamIndex: index(
			'team_invites_team_id_idx'
		).on(table.teamId),

		expiresIndex: index(
			'team_invites_expires_at_idx'
		).on(table.expiresAt)
	})
);

/* -------------------------------------------------------------------------- */
/* Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projects = pgTable(
	'projects',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		teamId: uuid('team_id')
			.notNull()
			.references(() => teams.id, {
				onDelete: 'cascade'
			}),

		trackId: uuid('track_id')
			.notNull()
			.references(() => tracks.id, {
				onDelete: 'restrict'
			}),

		title: varchar('title', {
			length: 200
		}).notNull(),

		projectTagline: varchar(
			'project_tagline',
			{
				length: 500
			}
		),

		summary: text('summary'),

		thumbnail: text('thumbnail'),

		imageGallery: text(
			'image_gallery'
		).array(),

		demoVideoUrl: text(
			'demo_video_url'
		),

		repoUrl: text('repo_url'),

		deployedLiveLink: text(
			'deployed_live_link'
		),

		techTags: text(
			'tech_tags'
		).array(),

		status: varchar('status', {
			length: 20
		})
			.notNull()
			.default('draft'),

		submittedAt: timestamp('submitted_at', {
			withTimezone: true
		})
	},
	(table) => ({
		/*
		 * A team can have only one project.
		 *
		 * Team identity is determined by team_id, not team_name.
		 * Therefore teams with the same name but different IDs
		 * are still separate teams and may each have one project.
		 */
		teamUnique: uniqueIndex(
			'projects_team_id_unique_idx'
		).on(table.teamId),

		trackIndex: index(
			'projects_track_id_idx'
		).on(table.trackId),

		statusIndex: index(
			'projects_status_idx'
		).on(table.status)
	})
);

/* -------------------------------------------------------------------------- */
/* Custom Answers                                                             */
/* -------------------------------------------------------------------------- */

export const customAnswers = pgTable(
	'custom_answers',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, {
				onDelete: 'cascade'
			}),

		questionId: uuid('question_id')
			.notNull()
			.references(() => customQuestions.id, {
				onDelete: 'cascade'
			}),

		answer: text('answer'),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		projectIndex: index(
			'custom_answers_project_id_idx'
		).on(table.projectId),

		questionIndex: index(
			'custom_answers_question_id_idx'
		).on(table.questionId),

		projectQuestionUnique: uniqueIndex(
			'custom_answers_project_question_unique_idx'
		).on(
			table.projectId,
			table.questionId
		)
	})
);

/* -------------------------------------------------------------------------- */
/* Judge Track Eligibility                                                    */
/* -------------------------------------------------------------------------- */

export const judgeTrackEligibility = pgTable(
	'judge_track_eligibility',
	{
		judgeId: uuid('judge_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),

		trackId: uuid('track_id')
			.notNull()
			.references(() => tracks.id, {
				onDelete: 'cascade'
			})
	},
	(table) => ({
		primaryKey: uniqueIndex(
			'judge_track_eligibility_unique_idx'
		).on(
			table.judgeId,
			table.trackId
		),

		judgeIndex: index(
			'judge_track_eligibility_judge_id_idx'
		).on(table.judgeId),

		trackIndex: index(
			'judge_track_eligibility_track_id_idx'
		).on(table.trackId)
	})
);

/* -------------------------------------------------------------------------- */
/* Judge Assignments                                                          */
/* -------------------------------------------------------------------------- */

export const judgeAssignments = pgTable(
	'judge_assignments',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		judgeId: uuid('judge_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),

		projectId: uuid('project_id')
			.notNull()
			.references(() => projects.id, {
				onDelete: 'cascade'
			}),

		assignedAt: timestamp('assigned_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull(),

		comment: text('comment')
	},
	(table) => ({
		judgeProjectUnique: uniqueIndex(
			'judge_assignments_judge_project_unique_idx'
		).on(
			table.judgeId,
			table.projectId
		),

		judgeIndex: index(
			'judge_assignments_judge_id_idx'
		).on(table.judgeId),

		projectIndex: index(
			'judge_assignments_project_id_idx'
		).on(table.projectId)
	})
);

/* -------------------------------------------------------------------------- */
/* Rubric Criteria                                                            */
/* -------------------------------------------------------------------------- */

export const rubricCriteria = pgTable(
	'rubric_criteria',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		eventId: uuid('event_id')
			.notNull()
			.references(() => events.id, {
				onDelete: 'cascade'
			}),

		name: varchar('name', {
			length: 100
		}).notNull(),

		weight: integer('weight')
			.notNull()
			.default(1),

		maxScore: integer('max_score')
			.notNull()
			.default(10)
	},
	(table) => ({
		eventIndex: index(
			'rubric_criteria_event_id_idx'
		).on(table.eventId),

		nameUnique: uniqueIndex(
			'rubric_criteria_event_name_unique_idx'
		).on(
			table.eventId,
			table.name
		)
	})
);

/* -------------------------------------------------------------------------- */
/* Scores                                                                      */
/* -------------------------------------------------------------------------- */

export const scores = pgTable(
	'scores',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		judgeAssignmentId: uuid(
			'judge_assignment_id'
		)
			.notNull()
			.references(
				() => judgeAssignments.id,
				{
					onDelete: 'cascade'
				}
			),

		criterionId: uuid('criterion_id')
			.notNull()
			.references(
				() => rubricCriteria.id,
				{
					onDelete: 'cascade'
				}
			),

		score: integer('score').notNull()
	},
	(table) => ({
		assignmentCriterionUnique: uniqueIndex(
			'scores_assignment_criterion_unique_idx'
		).on(
			table.judgeAssignmentId,
			table.criterionId
		),

		assignmentIndex: index(
			'scores_judge_assignment_id_idx'
		).on(table.judgeAssignmentId),

		criterionIndex: index(
			'scores_criterion_id_idx'
		).on(table.criterionId)
	})
);

/* -------------------------------------------------------------------------- */
/* Judge Invites                                                              */
/* -------------------------------------------------------------------------- */

export const judgeInvites = pgTable(
	'judge_invites',
	{
		id: uuid('id').defaultRandom().primaryKey(),

		judgeId: uuid('judge_id')
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),

		tokenHash: varchar('token_hash', {
			length: 128
		}).notNull(),

		expiresAt: timestamp('expires_at', {
			withTimezone: true
		}),

		createdAt: timestamp('created_at', {
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	(table) => ({
		tokenUnique: uniqueIndex(
			'judge_invites_token_hash_unique_idx'
		).on(table.tokenHash),

		judgeIndex: index(
			'judge_invites_judge_id_idx'
		).on(table.judgeId),

		expiresIndex: index(
			'judge_invites_expires_at_idx'
		).on(table.expiresAt)
	})
);