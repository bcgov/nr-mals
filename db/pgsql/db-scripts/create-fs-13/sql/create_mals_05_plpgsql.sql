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

--
--  PROCEDURE PR_GENERATE_PRINT_JSON
--
create or replace procedure pr_generate_print_json(
  ip_print_category in    varchar(100),
  iop_print_job_id  inout integer)
  language plpgsql    
  as $$
  declare  
	l_certificate_json_count  integer default 0;
	l_envelope_json_count     integer default 0;
	l_card_json_count         integer default 0;
	l_renewal_json_count      integer default 0;  
  begin
	-- Start a row in the  
	insert into mal_print_job(
		job_status,
		print_category,
		execution_start_time,
		json_end_time,
		document_end_time,
		certificate_json_count,
		envelope_json_count,
		card_json_count,
		renewal_json_count,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	values(
		'RUNNING',
		ip_print_category,
		current_timestamp, 
		null,
		null,
		0,
		0,
		0,
		0,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp)
	returning id into iop_print_job_id;
	--
	-- Certificate jobs populate the Certificate, Card and Envelope JSONs.
	if ip_print_category = 'CERTIFICATE' then
		 --
		 --  Generate the Certificate JSONs
		 --
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'CERTIFICATE',
			certificate_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_certificate_vw;
		GET DIAGNOSTICS l_certificate_json_count = ROW_COUNT;
		 --
		 --  Generate the Envelope JSONs
		 --
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'ENVELOPE',
			envelope_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_certificate_vw;
		GET DIAGNOSTICS l_envelope_json_count = ROW_COUNT;
		 --
		 --  Generate the Card JSONs, one row per licence type.
		 --
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			null,
			'CARD',
			card_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_card_vw;
		GET DIAGNOSTICS l_card_json_count = ROW_COUNT;
	end if;
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status              = 'COMPLETE',
		json_end_time           = current_timestamp,
		certificate_json_count  = l_certificate_json_count,
		envelope_json_count     = l_envelope_json_count,
		card_json_count         = l_card_json_count,
		renewal_json_count      = l_renewal_json_count,
		update_userid           = current_user,
		update_timestamp        = current_timestamp
	where id = iop_print_job_id;
end; 
$$;