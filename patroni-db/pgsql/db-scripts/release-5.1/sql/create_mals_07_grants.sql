SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;


--
-- TABLES
--

grant select, insert, update, delete on mal_premises_detail   to mals_app_role;
grant select, insert, update, delete on mal_premises_job      to mals_app_role;


--
--  PLPGSQL
--

grant execute on procedure pr_start_premises_job              to mals_app_role;
grant execute on procedure pr_process_premises_import         to mals_app_role;