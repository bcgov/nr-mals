SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_PREMISES_DETAIL
--
alter table mal_premises_detail 
  add constraint premdtl_premjob_fk foreign key (premises_job_id) 
  references mal_premises_job(id) 
  on delete no action not deferrable initially immediate;  