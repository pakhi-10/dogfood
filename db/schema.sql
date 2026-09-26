--
-- PostgreSQL database dump
--

\restrict ok0GMofUamoykoy1yG224TbaXXc8deTk5aYd61xX47aSCE4PaDvTA1l9aG1Lf2k

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-09-27 00:12:06

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 864 (class 1247 OID 25154)
-- Name: question_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.question_type AS ENUM (
    'text',
    'textarea',
    'number',
    'select',
    'radio',
    'checkbox'
);


ALTER TYPE public.question_type OWNER TO postgres;

--
-- TOC entry 861 (class 1247 OID 25143)
-- Name: user_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_type AS ENUM (
    'admin',
    'organizer',
    'participant',
    'judge',
    'visitor'
);


ALTER TYPE public.user_type OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 25352)
-- Name: custom_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer text
);


ALTER TABLE public.custom_answers OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25305)
-- Name: custom_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    question text NOT NULL,
    question_type public.question_type NOT NULL,
    required boolean DEFAULT false NOT NULL,
    options text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_question_options CHECK ((((question_type = ANY (ARRAY['select'::public.question_type, 'radio'::public.question_type, 'checkbox'::public.question_type])) AND (options IS NOT NULL) AND (cardinality(options) > 0)) OR ((question_type <> ALL (ARRAY['select'::public.question_type, 'radio'::public.question_type, 'checkbox'::public.question_type])) AND (options IS NULL))))
);


ALTER TABLE public.custom_questions OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 25185)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    tagline character varying(500),
    about text,
    min_team_size integer NOT NULL,
    max_team_size integer NOT NULL,
    website_link text,
    contact_email character varying(255),
    logo text,
    application_open_at timestamp with time zone,
    application_close_at timestamp with time zone,
    judging_start_at timestamp with time zone,
    judging_deadline timestamp with time zone,
    result_announcement timestamp with time zone,
    prizes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_application_period CHECK (((application_close_at IS NULL) OR (application_open_at IS NULL) OR (application_close_at > application_open_at))),
    CONSTRAINT valid_team_size CHECK (((min_team_size > 0) AND (max_team_size >= min_team_size)))
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25327)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT submissions_id_not_null NOT NULL,
    team_id uuid CONSTRAINT submissions_team_id_not_null NOT NULL,
    stage_id uuid CONSTRAINT submissions_stage_id_not_null NOT NULL,
    project_name character varying(200) CONSTRAINT submissions_project_name_not_null NOT NULL,
    project_tagline character varying(500),
    long_description text CONSTRAINT submissions_long_description_not_null NOT NULL,
    thumbnail text,
    image_gallery text[],
    demo_video_url text,
    repo_url text,
    deployed_live_link text,
    tech_tags text[],
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT submissions_submitted_at_not_null NOT NULL
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 25231)
-- Name: stages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    track_id uuid NOT NULL,
    form_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT valid_stage_period CHECK (((end_at IS NULL) OR (start_at IS NULL) OR (end_at > start_at)))
);


ALTER TABLE public.stages OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25201)
-- Name: submission_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submission_forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.submission_forms OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25282)
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_email character varying(255)
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25258)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    team_name character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leader_email character varying(255)
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 25211)
-- Name: tracks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tracks OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 25167)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(150) NOT NULL,
    type public.user_type NOT NULL,
    username character varying(100),
    email character varying(255),
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4962 (class 2606 OID 25362)
-- Name: custom_answers custom_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT custom_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 25321)
-- Name: custom_questions custom_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_questions
    ADD CONSTRAINT custom_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 4930 (class 2606 OID 25200)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 25245)
-- Name: stages stages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT stages_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 2606 OID 25210)
-- Name: submission_forms submission_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_forms
    ADD CONSTRAINT submission_forms_pkey PRIMARY KEY (id);


--
-- TOC entry 4958 (class 2606 OID 25341)
-- Name: projects submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 25292)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4946 (class 2606 OID 25269)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 4935 (class 2606 OID 25223)
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 25364)
-- Name: custom_answers unique_answer_per_question_per_submission; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT unique_answer_per_question_per_submission UNIQUE (submission_id, question_id);


--
-- TOC entry 4943 (class 2606 OID 25247)
-- Name: stages unique_stage_name_per_track; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT unique_stage_name_per_track UNIQUE (track_id, name);


--
-- TOC entry 4948 (class 2606 OID 25271)
-- Name: teams unique_team_name_per_event; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT unique_team_name_per_event UNIQUE (event_id, team_name);


--
-- TOC entry 4937 (class 2606 OID 25225)
-- Name: tracks unique_track_name_per_event; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT unique_track_name_per_event UNIQUE (event_id, name);


--
-- TOC entry 4960 (class 2606 OID 25388)
-- Name: projects uq_projects_team_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT uq_projects_team_id UNIQUE (team_id);


--
-- TOC entry 4922 (class 2606 OID 25390)
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- TOC entry 4924 (class 2606 OID 25184)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4926 (class 2606 OID 25180)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4928 (class 2606 OID 25182)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4963 (class 1259 OID 25386)
-- Name: idx_custom_answers_question_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_answers_question_id ON public.custom_answers USING btree (question_id);


--
-- TOC entry 4964 (class 1259 OID 25385)
-- Name: idx_custom_answers_submission_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_answers_submission_id ON public.custom_answers USING btree (submission_id);


--
-- TOC entry 4954 (class 1259 OID 25382)
-- Name: idx_custom_questions_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_questions_form_id ON public.custom_questions USING btree (form_id);


--
-- TOC entry 4938 (class 1259 OID 25377)
-- Name: idx_stages_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stages_form_id ON public.stages USING btree (form_id);


--
-- TOC entry 4939 (class 1259 OID 25376)
-- Name: idx_stages_track_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_stages_track_id ON public.stages USING btree (track_id);


--
-- TOC entry 4955 (class 1259 OID 25384)
-- Name: idx_submissions_stage_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_stage_id ON public.projects USING btree (stage_id);


--
-- TOC entry 4956 (class 1259 OID 25383)
-- Name: idx_submissions_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_team_id ON public.projects USING btree (team_id);


--
-- TOC entry 4949 (class 1259 OID 25380)
-- Name: idx_team_members_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_members_team_id ON public.team_members USING btree (team_id);


--
-- TOC entry 4944 (class 1259 OID 25378)
-- Name: idx_teams_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_event_id ON public.teams USING btree (event_id);


--
-- TOC entry 4933 (class 1259 OID 25375)
-- Name: idx_tracks_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tracks_event_id ON public.tracks USING btree (event_id);


--
-- TOC entry 4977 (class 2606 OID 25370)
-- Name: custom_answers fk_custom_answers_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT fk_custom_answers_question FOREIGN KEY (question_id) REFERENCES public.custom_questions(id) ON DELETE CASCADE;


--
-- TOC entry 4978 (class 2606 OID 25365)
-- Name: custom_answers fk_custom_answers_submission; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT fk_custom_answers_submission FOREIGN KEY (submission_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 4974 (class 2606 OID 25322)
-- Name: custom_questions fk_custom_questions_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_questions
    ADD CONSTRAINT fk_custom_questions_form FOREIGN KEY (form_id) REFERENCES public.submission_forms(id) ON DELETE CASCADE;


--
-- TOC entry 4968 (class 2606 OID 25253)
-- Name: stages fk_stages_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_stages_form FOREIGN KEY (form_id) REFERENCES public.submission_forms(id) ON DELETE RESTRICT;


--
-- TOC entry 4969 (class 2606 OID 25248)
-- Name: stages fk_stages_track; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stages
    ADD CONSTRAINT fk_stages_track FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- TOC entry 4975 (class 2606 OID 25347)
-- Name: projects fk_submissions_stage; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_submissions_stage FOREIGN KEY (stage_id) REFERENCES public.stages(id) ON DELETE RESTRICT;


--
-- TOC entry 4976 (class 2606 OID 25342)
-- Name: projects fk_submissions_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_submissions_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4972 (class 2606 OID 25295)
-- Name: team_members fk_team_members_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 4973 (class 2606 OID 25396)
-- Name: team_members fk_team_members_user_email; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT fk_team_members_user_email FOREIGN KEY (user_email) REFERENCES public.users(email);


--
-- TOC entry 4970 (class 2606 OID 25272)
-- Name: teams fk_teams_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT fk_teams_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 4971 (class 2606 OID 25391)
-- Name: teams fk_teams_leader_email; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT fk_teams_leader_email FOREIGN KEY (leader_email) REFERENCES public.users(email);


--
-- TOC entry 4967 (class 2606 OID 25226)
-- Name: tracks fk_tracks_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fk_tracks_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


-- Completed on 2026-09-27 00:12:07

--
-- PostgreSQL database dump complete
--

\unrestrict ok0GMofUamoykoy1yG224TbaXXc8deTk5aYd61xX47aSCE4PaDvTA1l9aG1Lf2k

