SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;	


COMMENT ON TABLE mal_premises_detail    IS 'Batch job summary for loading the file data..';

COMMENT ON TABLE mal_premises_job       IS 'Batch job details for loading the file data.';

