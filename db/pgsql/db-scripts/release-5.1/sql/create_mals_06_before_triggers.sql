SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_PREMISES_JOB
--
create trigger mal_trg_premises_job_biu
before insert or update on mal_premises_job
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_PREMISES_DETAIL
--
create trigger mal_trg_premises_detail_biu
before insert or update on mal_premises_detail
  for each row execute function fn_update_audit_columns();
