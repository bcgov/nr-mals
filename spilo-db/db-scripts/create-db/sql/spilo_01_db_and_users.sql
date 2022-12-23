
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;

-- CREATE MALS USER
drop role if exists mals;
create role mals with LOGIN PASSWORD '5uQHCaf6cE8GJmajpbhLwJf5UMnUoj0g';	

-- CREATE DATABASE
drop database if exists mals;
create database mals with encoding = 'UTF8' owner mals;

-- CREATE APP USER AND ROLE
drop role if exists app_proxy_user;
create role app_proxy_user with LOGIN PASSWORD 'SiKdOof3x5jOYe4BeI2wFOysdb3us1yn';

drop role if exists mals_app_role;
create role mals_app_role;

grant mals_app_role to app_proxy_user;
