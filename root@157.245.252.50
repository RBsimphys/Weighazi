--
-- PostgreSQL database dump
--

\restrict veeg8PO9JO9H91pvvDFxR9AVm5jceGqpEiBs7ameG1TwyGZt0AsbeB5qYmhxkwP

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: userdb; Type: TABLE; Schema: public; Owner: rami
--

CREATE TABLE public.userdb (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    height real NOT NULL,
    age integer NOT NULL,
    goalweight real NOT NULL,
    activitylevel integer NOT NULL,
    phonenumbers character varying(15),
    startingweight real NOT NULL,
    gender character varying(50),
    password character varying(60) NOT NULL
);


ALTER TABLE public.userdb OWNER TO rami;

--
-- Name: userdb_id_seq; Type: SEQUENCE; Schema: public; Owner: rami
--

CREATE SEQUENCE public.userdb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userdb_id_seq OWNER TO rami;

--
-- Name: userdb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rami
--

ALTER SEQUENCE public.userdb_id_seq OWNED BY public.userdb.id;


--
-- Name: weightlogs; Type: TABLE; Schema: public; Owner: rami
--

CREATE TABLE public.weightlogs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    weight real NOT NULL,
    logged_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.weightlogs OWNER TO rami;

--
-- Name: weightlogs_id_seq; Type: SEQUENCE; Schema: public; Owner: rami
--

CREATE SEQUENCE public.weightlogs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weightlogs_id_seq OWNER TO rami;

--
-- Name: weightlogs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: rami
--

ALTER SEQUENCE public.weightlogs_id_seq OWNED BY public.weightlogs.id;


--
-- Name: userdb id; Type: DEFAULT; Schema: public; Owner: rami
--

ALTER TABLE ONLY public.userdb ALTER COLUMN id SET DEFAULT nextval('public.userdb_id_seq'::regclass);


--
-- Name: weightlogs id; Type: DEFAULT; Schema: public; Owner: rami
--

ALTER TABLE ONLY public.weightlogs ALTER COLUMN id SET DEFAULT nextval('public.weightlogs_id_seq'::regclass);


--
-- Data for Name: userdb; Type: TABLE DATA; Schema: public; Owner: rami
--

COPY public.userdb (id, name, height, age, goalweight, activitylevel, phonenumbers, startingweight, gender, password) FROM stdin;
26	Rami	170	26	187	0	+16824445354	180	Male	Lololalo10!@#
\.


--
-- Data for Name: weightlogs; Type: TABLE DATA; Schema: public; Owner: rami
--

COPY public.weightlogs (id, user_id, weight, logged_at) FROM stdin;
233	26	180	2026-05-23 17:53:23.401408
234	26	179	2026-05-23 17:53:30.985782
235	26	190	2026-05-23 17:53:40.066313
\.


--
-- Name: userdb_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rami
--

SELECT pg_catalog.setval('public.userdb_id_seq', 26, true);


--
-- Name: weightlogs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: rami
--

SELECT pg_catalog.setval('public.weightlogs_id_seq', 235, true);


--
-- Name: userdb uq_userdb_name; Type: CONSTRAINT; Schema: public; Owner: rami
--

ALTER TABLE ONLY public.userdb
    ADD CONSTRAINT uq_userdb_name UNIQUE (name);


--
-- Name: userdb userdb_pkey; Type: CONSTRAINT; Schema: public; Owner: rami
--

ALTER TABLE ONLY public.userdb
    ADD CONSTRAINT userdb_pkey PRIMARY KEY (id);


--
-- Name: weightlogs weightlogs_pkey; Type: CONSTRAINT; Schema: public; Owner: rami
--

ALTER TABLE ONLY public.weightlogs
    ADD CONSTRAINT weightlogs_pkey PRIMARY KEY (id);


--
-- Name: weightlogs fk_user; Type: FK CONSTRAINT; Schema: public; Owner: rami
--

ALTER TABLE ONLY public.weightlogs
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.userdb(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict veeg8PO9JO9H91pvvDFxR9AVm5jceGqpEiBs7ameG1TwyGZt0AsbeB5qYmhxkwP

