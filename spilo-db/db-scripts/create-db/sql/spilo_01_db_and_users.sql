
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- New passwords should have been generated when the spilo secret was updated
--

-- CREATE MALS USER
drop role if exists mals;
create role mals with LOGIN PASSWORD '<<postgres password>>';	

-- CREATE DATABASE
drop database if exists mals;
create database mals with encoding = 'UTF8' owner mals;

-- CREATE APP USER AND ROLE
drop role if exists app_proxy_user;
create role app_proxy_user with LOGIN PASSWORD '<<postgres password>>';

drop role if exists mals_app_role;
create role mals_app_role;

grant mals_app_role to app_proxy_user;
