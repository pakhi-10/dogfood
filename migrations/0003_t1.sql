/* ==========================================================================
   DOGFOOD DATABASE MIGRATION
   Source of truth: schema.ts

   This migration is intended to be safe to run when objects already exist.
   Existing tables, columns, indexes, enums, and constraints are skipped.
   ========================================================================== */


/* ==========================================================================
   1. ENUMS
   ========================================================================== */

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'event_status'
    ) THEN
        CREATE TYPE event_status AS ENUM (
            'draft',
            'live'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'question_type'
    ) THEN
        CREATE TYPE question_type AS ENUM (
            'text',
            'textarea',
            'number',
            'select',
            'radio',
            'checkbox'
        );
    END IF;
END
$$;


/* ==========================================================================
   2. USERS
   ========================================================================== */

/*
   username is no longer part of schema.ts.

   PostgreSQL has no:
       ALTER TABLE ... DROP COLUMN IF EXISTS
   issues on supported versions, so this is safe if username is already gone.
*/

ALTER TABLE users
DROP COLUMN IF EXISTS username;


/* ==========================================================================
   3. SESSIONS
   ========================================================================== */

CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    token_hash VARCHAR(128) NOT NULL,

    expires_at TIMESTAMPTZ NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_token_hash_unique_idx
    ON sessions(token_hash);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx
    ON sessions(user_id);

CREATE INDEX IF NOT EXISTS sessions_expires_at_idx
    ON sessions(expires_at);


/* ==========================================================================
   4. EVENTS
   ========================================================================== */

ALTER TABLE events
ADD COLUMN IF NOT EXISTS organizer_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'events_organizer_id_users_id_fk'
    ) THEN
        ALTER TABLE events
        ADD CONSTRAINT events_organizer_id_users_id_fk
        FOREIGN KEY (organizer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT;
    END IF;
END
$$;

ALTER TABLE events
ADD COLUMN IF NOT EXISTS status event_status
    DEFAULT 'draft';

ALTER TABLE events
ALTER COLUMN status SET DEFAULT 'draft';

ALTER TABLE events
ALTER COLUMN status SET NOT NULL;

ALTER TABLE events
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS events_organizer_id_idx
    ON events(organizer_id);

CREATE INDEX IF NOT EXISTS events_status_idx
    ON events(status);


/* ==========================================================================
   5. TRACKS
   ========================================================================== */

CREATE TABLE IF NOT EXISTS tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    event_id UUID NOT NULL
        REFERENCES events(id)
        ON DELETE CASCADE,

    name VARCHAR(200) NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tracks_event_id_idx
    ON tracks(event_id);


/* ==========================================================================
   6. SUBMISSION FORMS
   ========================================================================== */

CREATE TABLE IF NOT EXISTS submission_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    name VARCHAR(200) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);


/* ==========================================================================
   7. STAGES
   ========================================================================== */

CREATE TABLE IF NOT EXISTS stages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    track_id UUID NOT NULL
        REFERENCES tracks(id)
        ON DELETE CASCADE,

    form_id UUID NOT NULL
        REFERENCES submission_forms(id)
        ON DELETE RESTRICT,

    name VARCHAR(200) NOT NULL,

    description TEXT,

    start_at TIMESTAMPTZ,

    end_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS stages_track_id_idx
    ON stages(track_id);

CREATE INDEX IF NOT EXISTS stages_form_id_idx
    ON stages(form_id);


/* ==========================================================================
   8. CUSTOM QUESTIONS
   ========================================================================== */

CREATE TABLE IF NOT EXISTS custom_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    form_id UUID NOT NULL
        REFERENCES submission_forms(id)
        ON DELETE CASCADE,

    question TEXT NOT NULL,

    question_type question_type NOT NULL,

    required BOOLEAN NOT NULL
        DEFAULT FALSE,

    options TEXT[],

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS custom_questions_form_id_idx
    ON custom_questions(form_id);


/* ==========================================================================
   9. TEAMS
   ========================================================================== */

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS leader_mobile_number VARCHAR(20);

ALTER TABLE teams
ADD COLUMN IF NOT EXISTS current_stage_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'teams_current_stage_id_stages_id_fk'
    ) THEN
        ALTER TABLE teams
        ADD CONSTRAINT teams_current_stage_id_stages_id_fk
        FOREIGN KEY (current_stage_id)
        REFERENCES stages(id);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS teams_event_id_idx
    ON teams(event_id);

CREATE UNIQUE INDEX IF NOT EXISTS teams_event_name_unique_idx
    ON teams(event_id, team_name);

CREATE INDEX IF NOT EXISTS teams_current_stage_id_idx
    ON teams(current_stage_id);


/* ==========================================================================
   10. TEAM MEMBERS
   ========================================================================== */

CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    team_id UUID NOT NULL
        REFERENCES teams(id)
        ON DELETE CASCADE,

    joined_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    user_email VARCHAR(255)
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'team_members_user_email_users_email_fk'
    ) THEN
        ALTER TABLE team_members
        ADD CONSTRAINT team_members_user_email_users_email_fk
        FOREIGN KEY (user_email)
        REFERENCES users(email);
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS team_members_team_id_idx
    ON team_members(team_id);


/* ==========================================================================
   11. TEAM INVITES
   ========================================================================== */

CREATE TABLE IF NOT EXISTS team_invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    team_id UUID NOT NULL
        REFERENCES teams(id)
        ON DELETE CASCADE,

    token_hash VARCHAR(128) NOT NULL,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS team_invites_token_hash_unique_idx
    ON team_invites(token_hash);

CREATE INDEX IF NOT EXISTS team_invites_team_id_idx
    ON team_invites(team_id);

CREATE INDEX IF NOT EXISTS team_invites_expires_at_idx
    ON team_invites(expires_at);


/* ==========================================================================
   12. PROJECTS
   ========================================================================== */

/*
   Add track_id as nullable first.
   Existing projects are backfilled below.
*/

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS track_id UUID;


/*
   Add the foreign key if it does not already exist.
*/

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_track_id_tracks_id_fk'
    ) THEN
        ALTER TABLE projects
        ADD CONSTRAINT projects_track_id_tracks_id_fk
        FOREIGN KEY (track_id)
        REFERENCES tracks(id)
        ON DELETE RESTRICT;
    END IF;
END
$$;


/*
   Backfill track_id from the project's stage.
*/

UPDATE projects p
SET track_id = s.track_id
FROM stages s
WHERE p.stage_id = s.id
  AND p.track_id IS NULL;


/*
   schema.ts requires track_id to be NOT NULL.

   This will fail if there are existing projects whose track_id
   could not be determined from their stage.
*/

ALTER TABLE projects
ALTER COLUMN track_id SET NOT NULL;


/*
   Project status.
*/

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS status VARCHAR(20);

ALTER TABLE projects
ALTER COLUMN status SET DEFAULT 'draft';

UPDATE projects
SET status = 'draft'
WHERE status IS NULL;

ALTER TABLE projects
ALTER COLUMN status SET NOT NULL;


/*
   Match schema.ts:
       status: draft | submitted
*/

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'projects_status_check'
    ) THEN
        ALTER TABLE projects
        ADD CONSTRAINT projects_status_check
        CHECK (status IN ('draft', 'submitted'));
    END IF;
END
$$;


/*
   schema.ts:
       submittedAt: timestamp(...)
   No NOT NULL and no default.
*/

ALTER TABLE projects
ALTER COLUMN submitted_at DROP DEFAULT;

ALTER TABLE projects
ALTER COLUMN submitted_at DROP NOT NULL;


/*
   Project indexes.
*/

CREATE INDEX IF NOT EXISTS projects_team_id_idx
    ON projects(team_id);

CREATE INDEX IF NOT EXISTS projects_stage_id_idx
    ON projects(stage_id);

CREATE INDEX IF NOT EXISTS projects_track_id_idx
    ON projects(track_id);

CREATE INDEX IF NOT EXISTS projects_status_idx
    ON projects(status);


/* ==========================================================================
   13. CUSTOM ANSWERS
   ========================================================================== */

CREATE TABLE IF NOT EXISTS custom_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    project_id UUID NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    question_id UUID NOT NULL
        REFERENCES custom_questions(id)
        ON DELETE CASCADE,

    answer TEXT,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS custom_answers_project_id_idx
    ON custom_answers(project_id);

CREATE INDEX IF NOT EXISTS custom_answers_question_id_idx
    ON custom_answers(question_id);

CREATE UNIQUE INDEX IF NOT EXISTS custom_answers_project_question_unique_idx
    ON custom_answers(project_id, question_id);