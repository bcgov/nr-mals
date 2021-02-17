SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- FUNCTION:  FN_UPDATE_AUDIT_COLUMNS
--

create or replace function fn_update_audit_columns() 
returns trigger as $$
	begin
	if TG_OP = 'UPDATE' then
		NEW.update_timestamp  = current_timestamp;
	elsif TG_OP = 'INSERT' then
		NEW.create_userid     = coalesce(NEW.create_userid, current_user);
		NEW.create_timestamp  = current_timestamp;
		NEW.update_userid     = coalesce(NEW.update_userid, current_user);
		NEW.update_timestamp  = current_timestamp;
	end if;
	return NEW;
	end;
$$ language 'plpgsql';
