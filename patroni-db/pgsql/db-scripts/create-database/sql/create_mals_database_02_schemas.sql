SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;

drop schema if exists public;

drop schema if exists mals_app;

create schema mals_app;
grant all on schema mals_app to mals;

--create schema mals_stg;
--grant all on schema mals_stg to mals;

drop role if exists mals_app_role;
create role mals_app_role;
grant usage on schema mals_app to mals_app_role;
grant mals_app_role to app_proxy_user;
alter user mals in database mals set search_path to mals_app;
