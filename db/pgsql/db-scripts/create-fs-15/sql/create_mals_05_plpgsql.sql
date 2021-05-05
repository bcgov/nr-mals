SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- PROCEDURE:  PR_START_DAIRY_FARM_TEST_JOB
--

CREATE OR REPLACE PROCEDURE pr_start_dairy_farm_test_job(
    IN    ip_job_type character varying, 
    INOUT iop_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  begin
	-- Start a row in the  
	insert into mal_dairy_farm_test_job(
		job_source,
		job_status,
		execution_start_time,
		execution_end_time,
		source_row_count,
		target_insert_count,
		target_update_count,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	values(
		ip_job_type,
		'RUNNING',
		current_timestamp, 
		null,
		null,
		null,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp)
	returning id into iop_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_UPDATE_DAIRY_FARM_TEST_RESULTS
--

CREATE OR REPLACE PROCEDURE pr_update_dairy_farm_test_results(
    IN    ip_job_id integer, 
    IN    ip_target_insert_count integer,
    INOUT iop_job_status character varying,
    INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_target_update_count  integer default 0;
	l_licence_id_count     integer default 0;
  begin
	-- Update those columns which are derived from the inserted results.
	update mal_dairy_farm_test_result tgt
	    set 
		    licence_id                           = src.licence_id,
		    spc1_date                            = src.spc1_date,
		    spc1_infraction_flag                 = src.spc1_infraction_flag,
		    spc1_previous_infraction_first_date  = src.spc1_previous_infraction_first_date,
		    spc1_previous_infraction_count       = src.spc1_previous_infraction_count,
			spc1_levy_percentage                 = src.spc1_levy_percentage,
			spc1_correspondence_code             = src.spc1_correspondence_code,
			spc1_correspondence_description      = src.spc1_correspondence_description,
		    scc_date                             = src.scc_date,
		    scc_infraction_flag                  = src.scc_infraction_flag,
		    scc_previous_infraction_first_date   = src.scc_previous_infraction_first_date,
		    scc_previous_infraction_count        = src.scc_previous_infraction_count,
			scc_levy_percentage                  = src.scc_levy_percentage,
			scc_correspondence_code              = src.scc_correspondence_code,
			scc_correspondence_description       = src.scc_correspondence_description,
		    cry_date                             = src.cry_date,
		    cry_infraction_flag                  = src.cry_infraction_flag,
		    cry_previous_infraction_first_date   = src.cry_previous_infraction_first_date,
		    cry_previous_infraction_count        = src.cry_previous_infraction_count,
			cry_levy_percentage                  = src.cry_levy_percentage,
			cry_correspondence_code              = src.cry_correspondence_code,
			cry_correspondence_description       = src.cry_correspondence_description,
		    ffa_date                             = src.ffa_date,
		    ffa_infraction_flag                  = src.ffa_infraction_flag,
		    ffa_previous_infraction_first_date   = src.ffa_previous_infraction_first_date,
		    ffa_previous_infraction_count        = src.ffa_previous_infraction_count,
			ffa_levy_percentage                  = src.ffa_levy_percentage,
			ffa_correspondence_code              = src.ffa_correspondence_code,
			ffa_correspondence_description       = src.ffa_correspondence_description,
		    ih_date                              = src.ih_date,
		    ih_infraction_flag                   = src.ih_infraction_flag,
		    ih_previous_infraction_first_date    = src.ih_previous_infraction_first_date,
		    ih_previous_infraction_count         = src.ih_previous_infraction_count,
			ih_levy_percentage                   = src.ih_levy_percentage,
			ih_correspondence_code               = src.ih_correspondence_code,
			ih_correspondence_description        = src.ih_correspondence_description
	    from mal_dairy_farm_test_infraction_vw src
	    where tgt.id = src.test_result_id
		and tgt.test_job_id = ip_job_id;
		GET DIAGNOSTICS l_target_update_count = ROW_COUNT;
	-- Determine the process status.
	select count(licence_id)
	into l_licence_id_count
	from mal_dairy_farm_test_result
	where test_job_id = ip_job_id;
	iop_job_status := case 
                        when ip_target_insert_count = l_target_update_count and 
                             ip_target_insert_count = l_licence_id_count
                        then 'COMPLETE'
                        else 'WARNING'
                      end;
	iop_process_comments := concat( 'Insert count: ',ip_target_insert_count,  
                                   ', Update count: ',l_target_update_count,
                                   ', Licence ID count: ', l_licence_id_count);
	-- Update the Job table.
	update mals_app.mal_dairy_farm_test_job 
		set
			job_status              = iop_job_status,
			execution_end_time      = current_timestamp,
			target_update_count     = l_target_update_count,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
end; 
$procedure$
;

--
-- FUNCTION:  FN_UPDATE_AUDIT_COLUMNS
--

create or replace function fn_update_audit_columns() 
returns trigger as $$
	begin
	if TG_OP = 'UPDATE' then
		NEW.update_userid     = coalesce(NEW.update_userid, current_user);
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
-- FUNCTION:  FN_PR_GENERATE_PRINT_JSON
--

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json(
    IN    ip_print_category character varying, 
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
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
$procedure$
;
