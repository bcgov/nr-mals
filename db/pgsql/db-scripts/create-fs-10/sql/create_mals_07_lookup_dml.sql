SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_STATUS_CODE_LU
--

insert into mal_status_code_lu(code_name, code_description, active_flag)
  values ('DRA','Draft', true);
  
