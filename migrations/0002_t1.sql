-- ============================================================
-- DOGFOOD 2026
-- Migration 0002
-- Organizer functionality + submission track/stage changes
-- ============================================================


-- ============================================================
-- 1. EVENTS
-- Add draft/live status
-- ============================================================

ALTER TABLE events
ADD COLUMN status TEXT NOT NULL DEFAULT 'draft';


-- ============================================================
-- 2. USERS
-- Add mobile number for team registration
-- ============================================================

ALTER TABLE users
ADD COLUMN mobile_number TEXT;


-- ============================================================
-- 3. EVENT REGISTRATIONS
-- Tracks participants registering for an event
-- ============================================================

CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL
        REFERENCES events(id),

    user_id UUID NOT NULL
        REFERENCES users(id),

    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    status TEXT NOT NULL DEFAULT 'registered',

    CONSTRAINT event_registrations_event_user_unique
        UNIQUE (event_id, user_id)
);


-- ============================================================
-- 4. REGISTRATION FORMS
-- Separate from submission forms
-- ============================================================

CREATE TABLE registration_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL
        REFERENCES events(id),

    name TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 5. REGISTRATION QUESTIONS
-- Questions asked during team/event registration
-- ============================================================

CREATE TABLE registration_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    form_id UUID NOT NULL
        REFERENCES registration_forms(id),

    question TEXT NOT NULL,

    question_type TEXT NOT NULL,

    required BOOLEAN NOT NULL DEFAULT false,

    options TEXT
);


-- ============================================================
-- 6. REGISTRATION ANSWERS
-- Participant answers to registration questions
-- ============================================================

CREATE TABLE registration_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    question_id UUID NOT NULL
        REFERENCES registration_questions(id),

    registration_id UUID NOT NULL
        REFERENCES event_registrations(id),

    answer TEXT
);


-- ============================================================
-- 7. TEAMS
-- Track the team's current stage
-- ============================================================

ALTER TABLE teams
ADD COLUMN current_stage_id UUID
    REFERENCES stages(id);


-- ============================================================
-- 8. PROJECTS / SUBMISSIONS
-- Add explicit track relationship
-- ============================================================

ALTER TABLE projects
ADD COLUMN track_id UUID;


-- ============================================================
-- 9. BACKFILL PROJECT TRACKS
-- Existing projects get their track from their existing stage
-- ============================================================

UPDATE projects p
SET track_id = s.track_id
FROM stages s
WHERE p.stage_id = s.id;


-- ============================================================
-- 10. PROJECT TRACK FOREIGN KEY
-- ============================================================

ALTER TABLE projects
ADD CONSTRAINT projects_track_id_tracks_id_fk
FOREIGN KEY (track_id)
REFERENCES tracks(id);


-- ============================================================
-- 11. PROJECT TRACK IS REQUIRED
-- ============================================================

ALTER TABLE projects
ALTER COLUMN track_id SET NOT NULL;


-- ============================================================
-- 12. SUBMITTED AT
-- Draft projects should not have a submission timestamp.
-- NULL = not submitted
-- timestamp = submitted
-- ============================================================

ALTER TABLE projects
ALTER COLUMN submitted_at DROP DEFAULT;

ALTER TABLE projects
ALTER COLUMN submitted_at DROP NOT NULL;


-- ============================================================
-- 13. EMAIL VERIFICATION
-- Used if actual email verification is implemented
-- ============================================================

CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id),

    token_hash TEXT NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    verified_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);