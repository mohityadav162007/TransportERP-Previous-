--
-- PostgreSQL database dump
--

\restrict 86QUEluBUcfcLuJhTkZEj505MJDse292tZtGViJAlL6x9WrxvGB7RjDgOgGZebh

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_code text NOT NULL,
    loading_date timestamp without time zone NOT NULL,
    unloading_date timestamp without time zone,
    from_location text NOT NULL,
    to_location text NOT NULL,
    vehicle_number text NOT NULL,
    driver_number text,
    motor_owner_name text,
    motor_owner_number text,
    gaadi_freight numeric NOT NULL,
    gaadi_advance numeric DEFAULT 0,
    gaadi_balance numeric,
    party_name text NOT NULL,
    party_number text,
    party_freight numeric NOT NULL,
    party_advance numeric DEFAULT 0,
    party_balance numeric,
    tds numeric DEFAULT 0,
    himmali numeric DEFAULT 0,
    payment_status text DEFAULT 'UNPAID'::text NOT NULL,
    profit numeric,
    pod_status text DEFAULT 'PENDING'::text,
    pod_path text,
    is_deleted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    weight numeric,
    remark text,
    CONSTRAINT trips_payment_status_check CHECK ((payment_status = ANY (ARRAY['PAID'::text, 'UNPAID'::text]))),
    CONSTRAINT trips_pod_status_check CHECK ((pod_status = ANY (ARRAY['PENDING'::text, 'UPLOADED'::text])))
);


ALTER TABLE public.trips OWNER TO postgres;

--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, trip_code, loading_date, unloading_date, from_location, to_location, vehicle_number, driver_number, motor_owner_name, motor_owner_number, gaadi_freight, gaadi_advance, gaadi_balance, party_name, party_number, party_freight, party_advance, party_balance, tds, himmali, payment_status, profit, pod_status, pod_path, is_deleted, created_at, updated_at, weight, remark) FROM stdin;
a41c4f49-48cb-46f3-8e63-ab80c1896ef4	2026_01_001	2026-01-03 00:00:00	\N	Indore	Jabalpur	MP37ZC8219	7879927324	Ritik Yadav	6260001228	30000	28000	2000	DELHIVERY 	NIL	32000	30000	3900	300	2200	UNPAID	3900	UPLOADED	D:/TransportERP/backend/uploads/pod/pod_a41c4f49-48cb-46f3-8e63-ab80c1896ef4.png	f	2026-01-03 12:30:31.035831	2026-01-03 21:21:11.279142	\N	\N
666e6cc9-e760-4644-9086-b03b0b0c9643	2026_01_002	2026-01-01 05:30:00	2026-01-03 05:30:00	Indore	Jabalpur	MP37ZC8219	7879927324	Ritik Yadav	6260001228	26000	24000	2000	DELHIVERY 	9999999999	28000	26000	2590	260	850	UNPAID	2590	UPLOADED	D:/TransportERP/backend/uploads/pod/pod_666e6cc9-e760-4644-9086-b03b0b0c9643.png	f	2026-01-03 21:14:33.835057	2026-01-03 21:21:11.94643	9	No issue
36456dee-08b1-4b43-b775-5d0d94bc62bd	2025_01_001	2025-01-10 00:00:00	2025-01-12 00:00:00	Indore	Bhopal	MP09AB1234	9000000000	Sharma Transport	9111111111	42000	20000	22000	ABC Traders	9222222222	50000	30000	21000	1000	2000	UNPAID	9000	UPLOADED	D:/TransportERP/backend/uploads/pod/pod_36456dee-08b1-4b43-b775-5d0d94bc62bd.png	f	2026-01-02 21:00:14.580678	2026-01-03 21:21:12.495899	\N	\N
\.


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: trips trips_trip_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_trip_code_key UNIQUE (trip_code);


--
-- Name: idx_trips_is_deleted; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_is_deleted ON public.trips USING btree (is_deleted);


--
-- Name: idx_trips_loading_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_loading_date ON public.trips USING btree (loading_date);


--
-- Name: idx_trips_party; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_party ON public.trips USING btree (party_name);


--
-- Name: idx_trips_trip_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_trip_code ON public.trips USING btree (trip_code);


--
-- Name: idx_trips_vehicle; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_trips_vehicle ON public.trips USING btree (vehicle_number);


--
-- PostgreSQL database dump complete
--

\unrestrict 86QUEluBUcfcLuJhTkZEj505MJDse292tZtGViJAlL6x9WrxvGB7RjDgOgGZebh

