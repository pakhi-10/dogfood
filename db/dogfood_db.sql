--
-- PostgreSQL database dump
--

\restrict hemhWVs9zvmNiBMPhxx9YY9ENyJt9nOijIQk3xj0JlVbcehbHwcs019Bu48onlc

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

-- Started on 2026-09-28 00:54:21

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
-- TOC entry 900 (class 1247 OID 25459)
-- Name: event_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'live'
);


ALTER TYPE public.event_status OWNER TO postgres;

--
-- TOC entry 870 (class 1247 OID 25154)
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
-- TOC entry 867 (class 1247 OID 25143)
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
-- TOC entry 230 (class 1259 OID 25561)
-- Name: criteria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.criteria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    weight numeric(5,2) NOT NULL,
    max_score integer DEFAULT 5 NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT criteria_max_score_valid CHECK ((max_score > 0)),
    CONSTRAINT criteria_weight_valid CHECK (((weight > (0)::numeric) AND (weight <= (100)::numeric)))
);


ALTER TABLE public.criteria OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 25519)
-- Name: custom_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_answers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    question_id uuid NOT NULL,
    answer text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.custom_answers OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 25497)
-- Name: custom_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_questions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid NOT NULL,
    question text NOT NULL,
    question_type public.question_type NOT NULL,
    required boolean DEFAULT false NOT NULL,
    options text[],
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
    organizer_id uuid,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    published_at timestamp with time zone,
    submissions_close timestamp with time zone,
    CONSTRAINT valid_application_period CHECK (((application_close_at IS NULL) OR (application_open_at IS NULL) OR (application_close_at > application_open_at))),
    CONSTRAINT valid_team_size CHECK (((min_team_size > 0) AND (max_team_size >= min_team_size)))
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 25585)
-- Name: judge_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.judge_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    judge_id uuid NOT NULL,
    comment text,
    assigned_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    submitted_at timestamp with time zone
);


ALTER TABLE public.judge_assignments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 25685)
-- Name: judge_track_eligibility; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.judge_track_eligibility (
    judge_id uuid NOT NULL,
    track_id uuid NOT NULL
);


ALTER TABLE public.judge_track_eligibility OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 25327)
-- Name: projects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() CONSTRAINT submissions_id_not_null NOT NULL,
    team_id uuid CONSTRAINT submissions_team_id_not_null NOT NULL,
    title character varying(200) CONSTRAINT submissions_project_name_not_null NOT NULL,
    project_tagline character varying(500),
    summary text,
    thumbnail text,
    image_gallery text[],
    demo_video_url text,
    repo_url text,
    deployed_live_link text,
    tech_tags text[],
    submitted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP CONSTRAINT submissions_submitted_at_not_null NOT NULL,
    status character varying(20) DEFAULT 'draft'::character varying NOT NULL,
    track_id uuid NOT NULL,
    CONSTRAINT projects_valid_status CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'submitted'::character varying])::text[])))
);


ALTER TABLE public.projects OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 25708)
-- Name: rubric_criteria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rubric_criteria (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    weight integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.rubric_criteria OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 25612)
-- Name: scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scores (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    judge_assignment_id uuid NOT NULL,
    criterion_id uuid NOT NULL,
    score integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT scores_value_nonnegative CHECK ((score >= 0))
);


ALTER TABLE public.scores OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 25401)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash character varying(128) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 25201)
-- Name: submission_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.submission_forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    event_id uuid NOT NULL
);


ALTER TABLE public.submission_forms OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 25432)
-- Name: team_invites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    token_hash character varying(128) NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.team_invites OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 25282)
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
-- TOC entry 223 (class 1259 OID 25258)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid NOT NULL,
    team_name character varying(200) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    leader_email character varying(255),
    leader_mobile_number character varying(20)
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
    email character varying(255),
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5226 (class 0 OID 25561)
-- Dependencies: 230
-- Data for Name: criteria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.criteria (id, event_id, name, description, weight, max_score, created_at) FROM stdin;
\.


--
-- TOC entry 5225 (class 0 OID 25519)
-- Dependencies: 229
-- Data for Name: custom_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_answers (id, project_id, question_id, answer, created_at) FROM stdin;
\.


--
-- TOC entry 5224 (class 0 OID 25497)
-- Dependencies: 228
-- Data for Name: custom_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_questions (id, form_id, question, question_type, required, options, created_at) FROM stdin;
\.


--
-- TOC entry 5216 (class 0 OID 25185)
-- Dependencies: 220
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, name, tagline, about, min_team_size, max_team_size, website_link, contact_email, logo, application_open_at, application_close_at, judging_start_at, judging_deadline, result_announcement, prizes, created_at, organizer_id, status, published_at, submissions_close) FROM stdin;
9c78e21f-1ec6-4e80-9ced-96d36d86a3fd	Untitled event			1	4		organizer@dogfood.local		\N	\N	\N	\N	\N		2026-09-27 13:04:42.272924+05:30	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	draft	\N	\N
7e0c9629-9731-436e-926d-6026a718c48e	hack1	hack	first	2	5		organizer@dogfood.local		2026-09-27 13:35:00+05:30	2026-09-27 13:40:00+05:30	2026-09-27 02:25:00+05:30	2026-09-27 02:30:00+05:30	2026-09-27 02:30:00+05:30		2026-09-27 13:05:18.47107+05:30	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	live	2026-09-27 13:26:31.991+05:30	\N
a5cbd889-e571-434d-8c63-55fd6f689521	Untitled event			1	4		organizer@dogfood.local		\N	\N	\N	\N	\N		2026-09-27 14:15:23.064619+05:30	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	draft	\N	\N
02329e06-26c1-4c1f-974e-960864a519b4	Untitled event			1	4		organizer@dogfood.local		\N	\N	\N	\N	\N		2026-09-27 14:19:07.83357+05:30	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	draft	\N	\N
dfd2973b-a4bf-4897-9aac-1c734e74b905	Untitled event			1	4		organizer@dogfood.local		\N	\N	\N	\N	\N		2026-09-27 19:41:24.746041+05:30	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	draft	\N	\N
\.


--
-- TOC entry 5227 (class 0 OID 25585)
-- Dependencies: 231
-- Data for Name: judge_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.judge_assignments (id, project_id, judge_id, comment, assigned_at, submitted_at) FROM stdin;
\.


--
-- TOC entry 5229 (class 0 OID 25685)
-- Dependencies: 233
-- Data for Name: judge_track_eligibility; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.judge_track_eligibility (judge_id, track_id) FROM stdin;
\.


--
-- TOC entry 5221 (class 0 OID 25327)
-- Dependencies: 225
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.projects (id, team_id, title, project_tagline, summary, thumbnail, image_gallery, demo_video_url, repo_url, deployed_live_link, tech_tags, submitted_at, status, track_id) FROM stdin;
\.


--
-- TOC entry 5230 (class 0 OID 25708)
-- Dependencies: 234
-- Data for Name: rubric_criteria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rubric_criteria (id, name, weight) FROM stdin;
\.


--
-- TOC entry 5228 (class 0 OID 25612)
-- Dependencies: 232
-- Data for Name: scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scores (id, judge_assignment_id, criterion_id, score, created_at) FROM stdin;
\.


--
-- TOC entry 5222 (class 0 OID 25401)
-- Dependencies: 226
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, token_hash, expires_at, created_at) FROM stdin;
82dddd7a-8173-4231-9673-743bd24af10e	532bdf91-2b36-4b3c-aea8-f72785faf226	0175bc81a6f33502f110235113b1c2b3e22985f83b3f8e6b0b88457f8b7e79af	2026-10-04 10:33:54.974+05:30	2026-09-27 10:33:54.975522+05:30
86abcc6a-a078-4a60-817e-0925d48dc563	532bdf91-2b36-4b3c-aea8-f72785faf226	d417b0454529348ff526f0c3b8ce10858158bfb31f4e1d1e25a16f7325e49bf1	2026-10-04 12:16:48.068+05:30	2026-09-27 12:16:48.073678+05:30
e0f91524-8770-4ebe-b931-b9175272370b	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	2512a77890c0a329792de731407e3caa91e73f95b1a03c5be4360c539d7a0cb5	2026-10-04 16:38:43.253+05:30	2026-09-27 16:38:43.265395+05:30
10b7f083-69ed-4ebd-af25-de1981896d07	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	8d874c870b44138fa3600fc0fb2a01b059b52ad61ae92ab3ffc854f0a59400c1	2026-10-04 16:39:12.227+05:30	2026-09-27 16:39:12.229212+05:30
41c0060e-2a3a-4e75-a61d-e7af18245fa5	532bdf91-2b36-4b3c-aea8-f72785faf226	335a8477fd42fb34f7504fa6459724e6f5077e4d78ce137c9d2c626c9fe8956b	2026-10-04 16:39:58.495+05:30	2026-09-27 16:39:58.497133+05:30
26c0d847-c31d-475e-86fc-7c5269ef6190	9a07a173-073c-472c-beda-96bc747f62f7	a1a79dff6e93a8527e0927899de28cc98294977c486df5bae4048f33d8fb110f	2026-10-04 17:28:54.36+05:30	2026-09-27 17:28:54.363913+05:30
b1c0e31a-2ed4-4042-ad95-0a60e6ce29f6	9a07a173-073c-472c-beda-96bc747f62f7	6b649d785f5521546a1592755443b0bc4cfd5ad3b14924f6cf933c61cd1e8f75	2026-10-04 18:14:00.338+05:30	2026-09-27 18:14:00.345661+05:30
ee532cab-c9c5-4cea-b760-5bfe3cd058aa	9a07a173-073c-472c-beda-96bc747f62f7	de7aebeee414dda23da67561bdc11e3da44d00f35c96619113d428eddfe94f44	2026-10-04 18:26:52.623+05:30	2026-09-27 18:26:52.626712+05:30
755dec9b-e7fe-4947-b404-6098a0f6a02a	9a07a173-073c-472c-beda-96bc747f62f7	418efbd4bb531b3765509273daa0cf7c02d80894212cc0873f5b3c28166e3bb7	2026-10-04 19:16:03.662+05:30	2026-09-27 19:16:03.666765+05:30
4c148ad4-dec1-4149-bb89-1105ed52944f	9a07a173-073c-472c-beda-96bc747f62f7	11baf3681835f5b5ccfb5660133213756874af961ced411210d876d5a5fee692	2026-10-04 19:21:32.457+05:30	2026-09-27 19:21:32.470363+05:30
2b2e80d9-04b0-4781-b199-eaea101d962a	7d3cbbea-c1a6-44d5-93b6-21d88db4477d	30862c0cceaef4837a2fa9b996ea16416b1e17c5e0198aaea073bfed0bbc9728	2026-10-04 19:27:34.382+05:30	2026-09-27 19:27:34.388983+05:30
7fa3e9bb-7e3a-4cf1-aff7-2d70e4d82e8a	532bdf91-2b36-4b3c-aea8-f72785faf226	893bccf128100332e038e6da10009607faad31b638f72fbd66389ffda2ef356e	2026-10-04 19:42:24.213+05:30	2026-09-27 19:42:24.215714+05:30
\.


--
-- TOC entry 5217 (class 0 OID 25201)
-- Dependencies: 221
-- Data for Name: submission_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.submission_forms (id, name, created_at, event_id) FROM stdin;
\.


--
-- TOC entry 5223 (class 0 OID 25432)
-- Dependencies: 227
-- Data for Name: team_invites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_invites (id, team_id, token_hash, expires_at, created_at) FROM stdin;
\.


--
-- TOC entry 5220 (class 0 OID 25282)
-- Dependencies: 224
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, team_id, joined_at, user_email) FROM stdin;
\.


--
-- TOC entry 5219 (class 0 OID 25258)
-- Dependencies: 223
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, event_id, team_name, created_at, leader_email, leader_mobile_number) FROM stdin;
\.


--
-- TOC entry 5218 (class 0 OID 25211)
-- Dependencies: 222
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tracks (id, event_id, name, description, created_at) FROM stdin;
f6aa1ca9-3284-43af-b460-36dbce25dd5f	7e0c9629-9731-436e-926d-6026a718c48e	track1	\N	2026-09-27 13:23:29.690292+05:30
863a7dbb-d49e-487f-81fb-70068e5c1697	7e0c9629-9731-436e-926d-6026a718c48e	track	\N	2026-09-27 13:23:42.738636+05:30
\.


--
-- TOC entry 5215 (class 0 OID 25167)
-- Dependencies: 219
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, type, email, password, created_at) FROM stdin;
532bdf91-2b36-4b3c-aea8-f72785faf226	pakhi	participant	pakhipsinha@gmail.com	d24ee540ec52283309c6e7f88b994a87:4ebff237fa78398440e8e03b3cc2ae77eba27437a01c3c473fa94e7bda118f131d480c23aaa49f10dceef2630ae0fce5684c2dcf8650af71dad6f623684dbb09	2026-09-27 07:55:21.511001+05:30
13b6d98a-5f38-46bc-b1a9-60e92a5287e2	org1	organizer	organizer@example.com	testpassword	2026-09-27 09:39:05.827041+05:30
9a07a173-073c-472c-beda-96bc747f62f7	Dev Admin	admin	admin@dogfood.local	scrypt:539760a507464aea7716dd4787cbc8a3:255a77565394253655c9bf24aa537a32839a6e2a65694d06dd994f39352ecff174facb119dd37984be4a149de5fe20c4b4daa7064d8df6a86e7d625c19e9cbd4	2026-09-27 11:59:07.632006+05:30
7d3cbbea-c1a6-44d5-93b6-21d88db4477d	Dev Organizer	organizer	organizer@dogfood.local	scrypt:fe22d47b2e5caa457176db18fb1fef34:2527c361121204f9b8c60263b5937f5020f9f895ff710dbcee3c781cd0fa325af7de8082087cdf018a20204906b5ad6c12253c4d52fabf41dd1d725b15e68ac5	2026-09-27 11:59:07.716481+05:30
\.


--
-- TOC entry 5020 (class 2606 OID 25578)
-- Name: criteria criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.criteria
    ADD CONSTRAINT criteria_pkey PRIMARY KEY (id);


--
-- TOC entry 5014 (class 2606 OID 25531)
-- Name: custom_answers custom_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT custom_answers_pkey PRIMARY KEY (id);


--
-- TOC entry 5017 (class 2606 OID 25533)
-- Name: custom_answers custom_answers_project_question_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT custom_answers_project_question_unique UNIQUE (project_id, question_id);


--
-- TOC entry 5011 (class 2606 OID 25512)
-- Name: custom_questions custom_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_questions
    ADD CONSTRAINT custom_questions_pkey PRIMARY KEY (id);


--
-- TOC entry 4971 (class 2606 OID 25200)
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 25597)
-- Name: judge_assignments judge_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_assignments
    ADD CONSTRAINT judge_assignments_pkey PRIMARY KEY (id);


--
-- TOC entry 5041 (class 2606 OID 25691)
-- Name: judge_track_eligibility judge_track_eligibility_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_track_eligibility
    ADD CONSTRAINT judge_track_eligibility_pkey PRIMARY KEY (judge_id, track_id);


--
-- TOC entry 5043 (class 2606 OID 25717)
-- Name: rubric_criteria rubric_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rubric_criteria
    ADD CONSTRAINT rubric_criteria_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 25624)
-- Name: scores scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT scores_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 25412)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 25414)
-- Name: sessions sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4975 (class 2606 OID 25210)
-- Name: submission_forms submission_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_forms
    ADD CONSTRAINT submission_forms_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 25341)
-- Name: projects submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5006 (class 2606 OID 25442)
-- Name: team_invites team_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_invites
    ADD CONSTRAINT team_invites_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 25444)
-- Name: team_invites team_invites_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_invites
    ADD CONSTRAINT team_invites_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4988 (class 2606 OID 25292)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 25269)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 25223)
-- Name: tracks tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT tracks_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 25271)
-- Name: teams unique_team_name_per_event; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT unique_team_name_per_event UNIQUE (event_id, team_name);


--
-- TOC entry 5029 (class 2606 OID 25705)
-- Name: judge_assignments uq_judge_assignments_judge_project; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_assignments
    ADD CONSTRAINT uq_judge_assignments_judge_project UNIQUE (judge_id, project_id);


--
-- TOC entry 5031 (class 2606 OID 25599)
-- Name: judge_assignments uq_judge_assignments_project_judge; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_assignments
    ADD CONSTRAINT uq_judge_assignments_project_judge UNIQUE (project_id, judge_id);


--
-- TOC entry 4996 (class 2606 OID 25388)
-- Name: projects uq_projects_team_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT uq_projects_team_id UNIQUE (team_id);


--
-- TOC entry 5045 (class 2606 OID 25719)
-- Name: rubric_criteria uq_rubric_criteria_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rubric_criteria
    ADD CONSTRAINT uq_rubric_criteria_name UNIQUE (name);


--
-- TOC entry 5037 (class 2606 OID 25626)
-- Name: scores uq_scores_assignment_criterion; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT uq_scores_assignment_criterion UNIQUE (judge_assignment_id, criterion_id);


--
-- TOC entry 4977 (class 2606 OID 25552)
-- Name: submission_forms uq_submission_forms_event_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_forms
    ADD CONSTRAINT uq_submission_forms_event_id UNIQUE (event_id);


--
-- TOC entry 4965 (class 2606 OID 25390)
-- Name: users uq_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_email UNIQUE (email);


--
-- TOC entry 4967 (class 2606 OID 25184)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4969 (class 2606 OID 25180)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5015 (class 1259 OID 25544)
-- Name: custom_answers_project_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_answers_project_id_idx ON public.custom_answers USING btree (project_id);


--
-- TOC entry 5018 (class 1259 OID 25545)
-- Name: custom_answers_question_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_answers_question_id_idx ON public.custom_answers USING btree (question_id);


--
-- TOC entry 5009 (class 1259 OID 25518)
-- Name: custom_questions_form_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX custom_questions_form_id_idx ON public.custom_questions USING btree (form_id);


--
-- TOC entry 5021 (class 1259 OID 25584)
-- Name: idx_criteria_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_criteria_event_id ON public.criteria USING btree (event_id);


--
-- TOC entry 5012 (class 1259 OID 25560)
-- Name: idx_custom_questions_form_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_custom_questions_form_id ON public.custom_questions USING btree (form_id);


--
-- TOC entry 4972 (class 1259 OID 25427)
-- Name: idx_events_organizer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_organizer_id ON public.events USING btree (organizer_id);


--
-- TOC entry 5022 (class 1259 OID 25706)
-- Name: idx_ja_judge_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ja_judge_id ON public.judge_assignments USING btree (judge_id);


--
-- TOC entry 5023 (class 1259 OID 25707)
-- Name: idx_ja_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ja_project_id ON public.judge_assignments USING btree (project_id);


--
-- TOC entry 5038 (class 1259 OID 25702)
-- Name: idx_jte_judge_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jte_judge_id ON public.judge_track_eligibility USING btree (judge_id);


--
-- TOC entry 5039 (class 1259 OID 25703)
-- Name: idx_jte_track_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_jte_track_id ON public.judge_track_eligibility USING btree (track_id);


--
-- TOC entry 5024 (class 1259 OID 25611)
-- Name: idx_judge_assignments_judge_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_judge_assignments_judge_id ON public.judge_assignments USING btree (judge_id);


--
-- TOC entry 5025 (class 1259 OID 25610)
-- Name: idx_judge_assignments_project_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_judge_assignments_project_id ON public.judge_assignments USING btree (project_id);


--
-- TOC entry 4989 (class 1259 OID 25431)
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- TOC entry 4990 (class 1259 OID 25720)
-- Name: idx_projects_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_team_id ON public.projects USING btree (team_id);


--
-- TOC entry 4991 (class 1259 OID 25559)
-- Name: idx_projects_track_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_projects_track_id ON public.projects USING btree (track_id);


--
-- TOC entry 5032 (class 1259 OID 25638)
-- Name: idx_scores_criterion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scores_criterion_id ON public.scores USING btree (criterion_id);


--
-- TOC entry 5033 (class 1259 OID 25637)
-- Name: idx_scores_judge_assignment_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_scores_judge_assignment_id ON public.scores USING btree (judge_assignment_id);


--
-- TOC entry 4997 (class 1259 OID 25421)
-- Name: idx_sessions_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_expires_at ON public.sessions USING btree (expires_at);


--
-- TOC entry 4998 (class 1259 OID 25420)
-- Name: idx_sessions_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sessions_user_id ON public.sessions USING btree (user_id);


--
-- TOC entry 4973 (class 1259 OID 25553)
-- Name: idx_submission_forms_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submission_forms_event_id ON public.submission_forms USING btree (event_id);


--
-- TOC entry 4992 (class 1259 OID 25383)
-- Name: idx_submissions_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_submissions_team_id ON public.projects USING btree (team_id);


--
-- TOC entry 5003 (class 1259 OID 25451)
-- Name: idx_team_invites_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_invites_expires_at ON public.team_invites USING btree (expires_at);


--
-- TOC entry 5004 (class 1259 OID 25450)
-- Name: idx_team_invites_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_invites_team_id ON public.team_invites USING btree (team_id);


--
-- TOC entry 4986 (class 1259 OID 25380)
-- Name: idx_team_members_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_team_members_team_id ON public.team_members USING btree (team_id);


--
-- TOC entry 4981 (class 1259 OID 25378)
-- Name: idx_teams_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_teams_event_id ON public.teams USING btree (event_id);


--
-- TOC entry 4978 (class 1259 OID 25375)
-- Name: idx_tracks_event_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tracks_event_id ON public.tracks USING btree (event_id);


--
-- TOC entry 5061 (class 2606 OID 25579)
-- Name: criteria fk_criteria_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.criteria
    ADD CONSTRAINT fk_criteria_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5059 (class 2606 OID 25534)
-- Name: custom_answers fk_custom_answers_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT fk_custom_answers_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 5060 (class 2606 OID 25539)
-- Name: custom_answers fk_custom_answers_question; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_answers
    ADD CONSTRAINT fk_custom_answers_question FOREIGN KEY (question_id) REFERENCES public.custom_questions(id) ON DELETE CASCADE;


--
-- TOC entry 5058 (class 2606 OID 25513)
-- Name: custom_questions fk_custom_questions_form; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_questions
    ADD CONSTRAINT fk_custom_questions_form FOREIGN KEY (form_id) REFERENCES public.submission_forms(id) ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 25470)
-- Name: events fk_events_organizer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_events_organizer FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5066 (class 2606 OID 25692)
-- Name: judge_track_eligibility fk_jte_judge; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_track_eligibility
    ADD CONSTRAINT fk_jte_judge FOREIGN KEY (judge_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 25697)
-- Name: judge_track_eligibility fk_jte_track; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_track_eligibility
    ADD CONSTRAINT fk_jte_track FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE CASCADE;


--
-- TOC entry 5062 (class 2606 OID 25605)
-- Name: judge_assignments fk_judge_assignments_judge; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_assignments
    ADD CONSTRAINT fk_judge_assignments_judge FOREIGN KEY (judge_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 5063 (class 2606 OID 25600)
-- Name: judge_assignments fk_judge_assignments_project; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.judge_assignments
    ADD CONSTRAINT fk_judge_assignments_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- TOC entry 5053 (class 2606 OID 25554)
-- Name: projects fk_projects_track; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_track FOREIGN KEY (track_id) REFERENCES public.tracks(id) ON DELETE RESTRICT;


--
-- TOC entry 5064 (class 2606 OID 25632)
-- Name: scores fk_scores_criterion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT fk_scores_criterion FOREIGN KEY (criterion_id) REFERENCES public.criteria(id) ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 25627)
-- Name: scores fk_scores_judge_assignment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scores
    ADD CONSTRAINT fk_scores_judge_assignment FOREIGN KEY (judge_assignment_id) REFERENCES public.judge_assignments(id) ON DELETE CASCADE;


--
-- TOC entry 5056 (class 2606 OID 25415)
-- Name: sessions fk_sessions_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 5047 (class 2606 OID 25546)
-- Name: submission_forms fk_submission_forms_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.submission_forms
    ADD CONSTRAINT fk_submission_forms_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5054 (class 2606 OID 25342)
-- Name: projects fk_submissions_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_submissions_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5057 (class 2606 OID 25445)
-- Name: team_invites fk_team_invites_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_invites
    ADD CONSTRAINT fk_team_invites_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5051 (class 2606 OID 25295)
-- Name: team_members fk_team_members_team; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE;


--
-- TOC entry 5052 (class 2606 OID 25396)
-- Name: team_members fk_team_members_user_email; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT fk_team_members_user_email FOREIGN KEY (user_email) REFERENCES public.users(email);


--
-- TOC entry 5049 (class 2606 OID 25272)
-- Name: teams fk_teams_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT fk_teams_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5050 (class 2606 OID 25391)
-- Name: teams fk_teams_leader_email; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT fk_teams_leader_email FOREIGN KEY (leader_email) REFERENCES public.users(email);


--
-- TOC entry 5048 (class 2606 OID 25226)
-- Name: tracks fk_tracks_event; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracks
    ADD CONSTRAINT fk_tracks_event FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- TOC entry 5055 (class 2606 OID 25453)
-- Name: projects projects_track_id_tracks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_track_id_tracks_id_fk FOREIGN KEY (track_id) REFERENCES public.tracks(id);


-- Completed on 2026-09-28 00:54:22

--
-- PostgreSQL database dump complete
--

\unrestrict hemhWVs9zvmNiBMPhxx9YY9ENyJt9nOijIQk3xj0JlVbcehbHwcs019Bu48onlc

