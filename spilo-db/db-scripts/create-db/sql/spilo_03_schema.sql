
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;

drop schema if exists mals_app;
create schema mals_app;
grant all on schema mals_app to mals;

grant usage on schema mals_app to mals_app_role;

