BEGIN;

-- ============================================================
-- T1 AUTHENTICATION / SESSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(128) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessions_token_hash_key UNIQUE (token_hash),
    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
    ON public.sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
    ON public.sessions(expires_at);


-- ============================================================
-- T1 EVENT OWNERSHIP
-- ============================================================

ALTER TABLE public.events
    ADD COLUMN IF NOT EXISTS organizer_id uuid;

ALTER TABLE public.events
    DROP CONSTRAINT IF EXISTS fk_events_organizer;

ALTER TABLE public.events
    ADD CONSTRAINT fk_events_organizer
        FOREIGN KEY (organizer_id)
        REFERENCES public.users(id)
        ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_events_organizer_id
    ON public.events(organizer_id);


-- ============================================================
-- T1 PROJECT LIFECYCLE
-- ============================================================

ALTER TABLE public.projects
    ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'draft';

ALTER TABLE public.projects
    DROP CONSTRAINT IF EXISTS projects_valid_status;

ALTER TABLE public.projects
    ADD CONSTRAINT projects_valid_status
    CHECK (status IN ('draft', 'submitted'));

CREATE INDEX IF NOT EXISTS idx_projects_status
    ON public.projects(status);


-- ============================================================
-- T1 TEAM INVITE LINKS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.team_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    token_hash character varying(128) NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT team_invites_pkey PRIMARY KEY (id),
    CONSTRAINT team_invites_token_hash_key UNIQUE (token_hash),
    CONSTRAINT fk_team_invites_team
        FOREIGN KEY (team_id)
        REFERENCES public.teams(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_team_invites_team_id
    ON public.team_invites(team_id);

CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at
    ON public.team_invites(expires_at);


COMMIT;