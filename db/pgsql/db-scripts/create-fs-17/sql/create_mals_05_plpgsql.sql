SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;


-- FUNCTION:   FN_UPDATE_AUDIT_COLUMNS
-- PROCEDURE:  PR_GENERATE_PRINT_JSON
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_ACTION_REQUIRED
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_INSPECTION
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_PRODUCER_CITY
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_PRODUCER_DISTRICT
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_PRODUCER_REGION
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_QUALITY
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_TANK
-- PROCEDURE:  PR_START_DAIRY_FARM_TEST_JOB
-- PROCEDURE:  PR_START_PRINT_JOB
-- PROCEDURE:  PR_UPDATE_DAIRY_FARM_TEST_RESULTS


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
-- PROCEDURE:  PR_GENERATE_PRINT_JSON
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json(
    IN    ip_print_category character varying,
    IN    ip_start_date date,
    IN    ip_end_date date,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_certificate_json_count       integer default 0;
	l_envelope_json_count          integer default 0;
	l_card_json_count              integer default 0;
	l_renewal_json_count           integer default 0;  
	l_dairy_infraction_json_count  integer default 0; 
	l_recheck_notice_json_count    integer default 0;  
  begin
	  --
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => ip_print_category, 
			iop_print_job_id    => iop_print_job_id
			);
	--
	-- Populate the CERTIFICATE, ENVELOPE and CARD JSONs.
	if ip_print_category = 'CERTIFICATE' then
		 --
		 --  Generate the CERTIFICATE JSONs
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
		 --  Generate the ENVELOPE JSONs
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
		 --  Generate the CARD JSONs, one row per licence type.
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
	--
	-- Populate the RENEWAL JSONs.
	if ip_print_category = 'RENEWAL' then
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
			'RENEWAL',
			renewal_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_renewal_vw;
		GET DIAGNOSTICS l_renewal_json_count = ROW_COUNT;
	end if;
	--
	-- Populate the DAIRY_INFRACTION JSONs.
	if ip_print_category = 'DAIRY_INFRACTION' then
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
			'DAIRY_INFRACTION',
			infraction_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_dairy_farm_infraction_vw
		where print_dairy_infraction = true
	and recorded_date between ip_start_date and ip_end_date;
		GET DIAGNOSTICS l_dairy_infraction_json_count = ROW_COUNT;
	end if;
	--
	-- Populate the RECHECK_NOTICE JSONs.
	if ip_print_category = 'RECHECK_NOTICE' then
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
			'RECHECK_NOTICE',
			recheck_notice_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_dairy_farm_tank_recheck_vw
		where print_recheck_notice = true;
		GET DIAGNOSTICS l_recheck_notice_json_count = ROW_COUNT;
	end if;
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		certificate_json_count        = l_certificate_json_count,
		envelope_json_count           = l_envelope_json_count,
		card_json_count               = l_card_json_count,
		renewal_json_count            = l_renewal_json_count,
		dairy_infraction_json_count   = l_dairy_infraction_json_count,
		recheck_notice_json_count     = l_recheck_notice_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_ACTION_REQUIRED
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_action_required(
    IN    ip_licence_type_id integer,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_type_summary as (
		select 
			licence_type,
			json_agg(json_build_object('LicenceNumber',         licence_number,
									   'LastFirstName',         registrant_last_first,
									   'MailingAddress',        site_address,
									   'MailingCity',           site_city,
									   'MailingProv',           site_province,
									   'PostCode',              site_postal_code,
									   'Phone',                 site_primary_phone,
									   'Email',                 email_address,
									   'LicenceHolderCompany',  derived_licence_holder_name)
		                                order by licence_number) licence_json,
		    count(*) num_rows
		from mal_licence_action_required_vw
		where licence_type_id = ip_licence_type_id
		group by licence_type)
	--
	--  MAIN QUERY
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
		'ACTION_REQUIRED',
		json_build_object('DateTime',       to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Type',   licence_type,
						  'Licence',        licence_json,
						  'RowCount',       num_rows) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_type_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_INSPECTION
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_apiary_inspection(
    IN    ip_start_date date,
    IN    ip_end_date date,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with details as (   
		select 			
			licence_id,
			licence_number,
			apiary_site_id,
			region_name,
			last_name,
			first_name,
			inspection_date,
			colonies_tested,
			american_foulbrood_result,
			european_foulbrood_result,
			nosema_result,
			chalkbrood_result,
			sacbrood_result,
			varroa_tested,
			varroa_mite_result,
			varroa_mite_result_percent,
			small_hive_beetle_tested,
			small_hive_beetle_result,
			supers_inspected,
			supers_destroyed,
			hives_per_apiary,
			hive_count
		from mal_apiary_inspection_vw
		where licence_status = 'Active'
		and inspection_date between ip_start_date and ip_end_date
		),
	licence_summary as (
		select 
			json_agg(json_build_object('LicenceNumber',          licence_number,
									   'SiteID',                 apiary_site_id,
									   'LastName',               last_name,
									   'FirstName',              first_name,
									   'ColoniesInspected',      colonies_tested,
									   'AFB',                    american_foulbrood_result,
									   'EFB',                    european_foulbrood_result,
									   'Nosema',                 nosema_result,
									   'Chalkbrood',             chalkbrood_result,
									   'Sacbrood',               sacbrood_result,
									   'VarroaColoniesTested',   varroa_tested,
									   'VarroaMites',            varroa_mite_result,
									   'VarroaMitesPercent',     varroa_mite_result_percent,
									   'SHBColoniesTested',      small_hive_beetle_tested,
									   'SHB',                    small_hive_beetle_result,
									   'SupersInspected',        supers_inspected,
									   'SupersDestroyed',        supers_destroyed,
									   'HivesInApiary',          hives_per_apiary,
									   'TotalNumHives',          hive_count)
									   order by licence_number) licence_json
		from details),
	region_summary as (
		select 
			json_agg(json_build_object('RegionName',             region_name,
							           'ColoniesInspected',      region_colonies_tested,
							           'AFB',                    region_american_foulbrood_result,
							           'EFB',                    region_european_foulbrood_result,
							           'Nosema',                 region_nosema_result,
							           'Chalkbrood',             region_chalkbrood_result,
							           'Sacbrood',               region_sacbrood_result,
							           'VarroaColoniesTested',   region_varroa_tested,
							           'VarroaMites',            region_varroa_mite_result,
							           'SHBColoniesTested',      region_small_hive_beetle_tested,
							           'SHB',                    region_small_hive_beetle_result,
							           'SupersInspected',        region_supers_inspected,
							           'SupersDestroyed',        region_supers_destroyed)
									   order by region_name) region_json
		from (
				select 
					region_name,
					sum(colonies_tested) region_colonies_tested,
					sum(american_foulbrood_result) region_american_foulbrood_result,
					sum(european_foulbrood_result) region_european_foulbrood_result,
					sum(nosema_result) region_nosema_result,
					sum(chalkbrood_result) region_chalkbrood_result,
					sum(sacbrood_result) region_sacbrood_result,
					sum(varroa_tested) region_varroa_tested,
					sum(varroa_mite_result) region_varroa_mite_result,
					sum(small_hive_beetle_tested) region_small_hive_beetle_tested,
					sum(small_hive_beetle_result) region_small_hive_beetle_result,
					sum(supers_inspected) region_supers_inspected,
					sum(supers_destroyed) region_supers_destroyed
				from details
				group by region_name) region_totals),
	report_summary as ( 
		select 
			sum(colonies_tested) tot_colonies_tested,
			sum(american_foulbrood_result) tot_american_foulbrood_result,
			sum(european_foulbrood_result) tot_european_foulbrood_result,
			sum(nosema_result) tot_nosema_result,
			sum(chalkbrood_result) tot_chalkbrood_result,
			sum(sacbrood_result) tot_sacbrood_result,
			sum(varroa_tested) tot_varroa_tested,
			sum(varroa_mite_result) tot_varroa_mite_result,
			sum(small_hive_beetle_tested) tot_small_hive_beetle_tested,
			sum(small_hive_beetle_result) tot_small_hive_beetle_result,
			sum(supers_inspected) tot_supers_inspected,
			sum(supers_destroyed) tot_supers_destroyed
		from details)
	--
	--  MAIN QUERY
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
		null,
		null,
		'APIARY_INSPECTION',
		   json_build_object('DateTime',                     to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
							 'DateRangeStart',               to_char(ip_start_date, 'fmyyyy-mm-dd hh24mi'),
							 'DateRangeEnd',                 to_char(ip_end_date, 'fmyyyy-mm-dd hh24mi'),
							 'Licence',                      lic_sum.licence_json,		
							 'Region',                       rgn_sum.region_json,
							 'Tot_Colonies_Inspected',       rpt_sum.tot_colonies_tested,
							 'Tot_AFB',                      rpt_sum.tot_american_foulbrood_result,
							 'Tot_EFB',                      rpt_sum.tot_european_foulbrood_result,
							 'Tot_Nosema',                   rpt_sum.tot_nosema_result,
							 'Tot_Chalkbrood',               rpt_sum.tot_chalkbrood_result,
							 'Tot_Sacbrood',                 rpt_sum.tot_sacbrood_result,
							 'Tot_Colonies_Tested_Varroa',   rpt_sum.tot_varroa_tested,
							 'Tot_Varroa_Mites',             rpt_sum.tot_varroa_mite_result,
							 'Tot_Colonies_Tested_SHB',      rpt_sum.tot_small_hive_beetle_tested,
							 'Tot_SHB',                      rpt_sum.tot_small_hive_beetle_result,
							 'Tot_SupersInspected',          rpt_sum.tot_supers_inspected,
						     'Tot_SupersDestroyed',          rpt_sum.tot_supers_destroyed) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_summary lic_sum
	cross join region_summary rgn_sum
	cross join report_summary rpt_sum;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_PRODUCER_CITY
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_apiary_producer_city(
    IN    ip_city character varying,
    IN    ip_min_hives integer,
    IN    ip_max_hives integer,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with site_summary as (
			select 
				json_agg(json_build_object('LicenceNumber',         licence_number,
										   'LastName',              registrant_last_name,
										   'FirstName',             registrant_first_name,
										   'PrimaryPhone',          site_primary_phone,
										   'Email',                 registrant_email_address,
										   'Address',               site_address,
										   'City',                  site_city,
										   'Registration_Date',     registration_date,										   
										   'Num_Hives',             hive_count)
			                                order by licence_number) licence_json,
				count(licence_number) num_producers,
				sum(hive_count) num_hives
			from mal_apiary_producer_vw
			where site_city = ip_city
			and hive_count between ip_min_hives and ip_max_hives)
	--
	--  MAIN QUERY
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
		null,
		null,
		'APIARY_PRODUCER_CITY',
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
						  'NumColoniesBegin',   ip_min_hives,
						  'NumColoniesEnd',     ip_max_hives,
						  'Reg',                licence_json,
						  'Tot_Producers',      num_producers,
						  'Tot_Hives',          num_hives) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from site_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_PRODUCER_DISTRICT
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_apiary_producer_district(
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
			select licence_id,
				site_regional_district_id,
				count(*) num_sites,
				sum(hive_count) num_hives,
				count(case when hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			group by licence_id,
				site_regional_district_id),
		district_summary as (
			select coalesce(dist.district_name, 'No Region Specified') district_name,
				count(case when num_sites between 1 and  9 then 1 else null end) num_sites_1to9,
				count(case when num_sites >= 10            then 1 else null end) num_sites_10plus,
				count(case when num_sites between 1 and 24 then 1 else null end) num_sites_1to24,
				count(case when num_sites >= 25            then 1 else null end) num_sites_25plus,
				count(*) num_sites,
				sum(case when num_sites between 1 and  9 then num_hives else 0 end) num_hives_1to9,
				sum(case when num_sites >= 10            then num_hives else 0 end) num_hives_10plus,
				sum(case when num_sites between 1 and 24 then num_hives else 0 end) num_hives_1to24,
				sum(case when num_sites >= 25            then num_hives else 0 end) num_hives_25plus,
				sum(num_hives) num_hives,
				sum(num_producers_hives_0) num_producers_hives_0
			from licence_summary ls
			left join mal_regional_district_lu dist
			on ls.site_regional_district_id = dist.id
			group by dist.district_name),
		report_summary as (
			select 
				json_agg(json_build_object('DistrictName',       district_name,
										   'Producers1To9',      num_sites_1to9,
										   'Producers10Plus',    num_sites_10plus,
										   'Producers1To24',     num_sites_1to24,
										   'Producers25Plus',    num_sites_25plus,
										   'ProducersTotal',     num_sites,
										   'Colonies1To9',       num_hives_1to9,
										   'Colonies10Plus',     num_hives_10plus,	
										   'Colonies1To24',      num_hives_1to24,
										   'Colonies25Plus',     num_hives_25plus,										   
										   'ColoniesTotal',      num_hives)
			                                order by district_name) district_json,
				sum(num_sites_1to9) total_sites_1To9,
				sum(num_sites_10plus) total_sites_10Plus,
				sum(num_sites_1to24) total_sites_1To24,
				sum(num_sites_25plus) total_sites_25Plus,
				sum(num_sites) total_sites,
				sum(num_hives_1to9) total_hives_1To9,
				sum(num_hives_10plus) total_hives_10Plus,
				sum(num_hives_1to24) total_hives_1To24,
				sum(num_hives_25plus) total_hives_25Plus,
				sum(num_hives) total_hives,
				sum(num_producers_hives_0) total_producers_hives_0
			from district_summary)
	--
	--  MAIN QUERY
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
		null,
		null,
		'APIARY_PRODUCER_DISTRICT',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
						  'District',                  district_json,
						  'TotalProducers1To9',        total_sites_1To9,
						  'TotalProducers10Plus',      total_sites_10Plus,
						  'TotalProducers1To24',       total_sites_1To24,
						  'TotalProducers25Plus',      total_sites_25Plus,
						  'TotalNumProducers',         total_sites,
						  'TotalColonies1To9',         total_hives_1To9,
						  'TotalColonies10Plus',       total_hives_10Plus,
						  'TotalColonies1To24',        total_hives_1To24,
						  'TotalColonies25Plus',       total_hives_25Plus,
						  'TotalNumColonies',          total_hives,
						  'ProducersWithNoColonies',   total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from report_summary;  
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_PRODUCER_REGION
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_apiary_producer_region(
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
			select licence_id,
				site_region_id,
				count(*) num_sites,
				sum(hive_count) num_hives,
				count(case when hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			group by licence_id,
				site_region_id),
		region_summary as (
			select coalesce(rgn.region_name, 'No Region Specified') region_name,
				count(case when num_sites between 1 and  9 then 1 else null end) num_sites_1to9,
				count(case when num_sites >= 10            then 1 else null end) num_sites_10plus,
				count(case when num_sites between 1 and 24 then 1 else null end) num_sites_1to24,
				count(case when num_sites >= 25            then 1 else null end) num_sites_25plus,
				count(*) num_sites,
				sum(case when num_sites between 1 and  9 then num_hives else 0 end) num_hives_1to9,
				sum(case when num_sites >= 10            then num_hives else 0 end) num_hives_10plus,
				sum(case when num_sites between 1 and 24 then num_hives else 0 end) num_hives_1to24,
				sum(case when num_sites >= 25            then num_hives else 0 end) num_hives_25plus,
				sum(num_hives) num_hives,
				sum(num_producers_hives_0) num_producers_hives_0
			from licence_summary ls
			left join mal_region_lu rgn
			on ls.site_region_id = rgn.id
			group by rgn.region_name),
		report_summary as (
			select 
				json_agg(json_build_object('RegionName',       region_name,
										   'Producers1To9',      num_sites_1to9,
										   'Producers10Plus',    num_sites_10plus,
										   'Producers1To24',     num_sites_1to24,
										   'Producers25Plus',    num_sites_25plus,
										   'ProducersTotal',     num_sites,
										   'Colonies1To9',       num_hives_1to9,
										   'Colonies10Plus',     num_hives_10plus,	
										   'Colonies1To24',      num_hives_1to24,
										   'Colonies25Plus',     num_hives_25plus,										   
										   'ColoniesTotal',      num_hives)
			                                order by region_name) region_json,
				sum(num_sites_1to9) total_sites_1To9,
				sum(num_sites_10plus) total_sites_10Plus,
				sum(num_sites_1to24) total_sites_1To24,
				sum(num_sites_25plus) total_sites_25Plus,
				sum(num_sites) total_sites,
				sum(num_hives_1to9) total_hives_1To9,
				sum(num_hives_10plus) total_hives_10Plus,
				sum(num_hives_1to24) total_hives_1To24,
				sum(num_hives_25plus) total_hives_25Plus,
				sum(num_hives) total_hives,
				sum(num_producers_hives_0) total_producers_hives_0
			from region_summary)
	--
	--  MAIN QUERY
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
		null,
		null,
		'APIARY_PRODUCER_REGION',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
						  'Region',                    region_json,
						  'TotalProducers1To9',        total_sites_1To9,
						  'TotalProducers10Plus',      total_sites_10Plus,
						  'TotalProducers1To24',       total_sites_1To24,
						  'TotalProducers25Plus',      total_sites_25Plus,
						  'TotalNumProducers',         total_sites,
						  'TotalColonies1To9',         total_hives_1To9,
						  'TotalColonies10Plus',       total_hives_10Plus,
						  'TotalColonies1To24',        total_hives_1To24,
						  'TotalColonies25Plus',       total_hives_25Plus,
						  'TotalNumColonies',          total_hives,
						  'ProducersWithNoColonies',   total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from report_summary;  
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_QUALITY
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_dairy_farm_quality(
    IN    ip_start_date date,
    IN    ip_end_date date,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
		select licence_id,
			irma_number,	
		    derived_licence_holder_name,
			registrant_last_name,
			sum(scc_value) sum_scc_value,
			count(scc_value) num_scc_results,
			case when coalesce(count(scc_value), 0) >0 
				 then sum(scc_value)/count(scc_value)
				 else null
			end scc_average,
			sum(spc1_value) sum_spc1_value,
			count(spc1_value) num_spc1_results,
			case when coalesce(count(spc1_value), 0) >0 
				 then sum(spc1_value)/count(spc1_value)
				 else null
			end spc1_average
		from mal_dairy_farm_quality_vw
		where spc1_date between ip_start_date and ip_end_date
		or    scc_date  between ip_start_date and ip_end_date
		group by licence_id,
			irma_number,
		    derived_licence_holder_name,
			registrant_last_name),
		json_summary as (
			select 
				json_agg(json_build_object('IRMA_Num',              irma_number,
										   'LicenceHolderCompany',  derived_licence_holder_name,
										   'Lastname',              registrant_last_name,
										   'SCC_Average',           scc_average,
										   'IBC_Average',           spc1_average)
										   order by irma_number) licence_json,
				--  SCC
				sum(sum_scc_value) tot_scc_value,
				sum(num_scc_results) num_scc_results,
				case when coalesce(sum(num_scc_results), 0) >0 
					 then sum(sum_scc_value)/sum(num_scc_results)
					 else null
				end report_scc_average,
				--  SPC1
				sum(sum_spc1_value) tot_spc1_value,
				sum(num_spc1_results) num_spc1_results,
				case when coalesce(sum(num_spc1_results), 0) >0 
					 then sum(sum_spc1_value)/sum(num_spc1_results)
					 else null
				end report_spc1_average
			from licence_summary)
		--
		--  MAIN QUERY
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
			null,
			null,
			'DAIRY_FARM_QUALITY',
			json_build_object('DateTime',         to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
							  'DateRangeStart',   to_char(ip_start_date, 'fmyyyy-mm-dd hh24mi'),
							  'DateRangeEnd',     to_char(ip_end_date, 'fmyyyy-mm-dd hh24mi'),
							  'Reg',              json_summary.licence_json,		
							  'SCC_Report_Avg',   report_scc_average,
							  'IBC_Report_Avg',   report_spc1_average) report_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from json_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_LICENCE_LOCATION
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_licence_location(
    IN    ip_licence_type_id integer,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
		select 
			lic.licence_type,
			json_agg(json_build_object('LicenceNumber',               lic.licence_number,
				                       'IssueDate',                   issue_date,     
				                       'ExpiryDate',                  lic.expiry_date,      
				                       'Lastname',                    lic.last_name,
				                       'Firstname',                   lic.first_name,
				                       'MailingAddress',              lic.derived_mailing_address,
				                       'MailingCity',                 lic.derived_mailing_city,
				                       'MailingProv',                 lic.derived_mailing_province,
				                       'PostCode',                    lic.derived_mailing_postal_code,
				                       'Phone',                       lic.primary_phone,
				                       'Email',                       lic.email_address,	
				                       'FeeCollected',                lic.fee_collected,
				                       'BondContinuationExpiryDate',  lic.bond_continuation_expiry_date,                     
				                       'SpeciesType',                 spec.species_code,
				                       'SpeciesMale',                 spec.male_count,
				                       'SpeciesFemale',               spec.female_count)
				                       order by lic.licence_number, spec.species_code) licence_json,
			count(*) num_rows
		from mal_licence_summary_vw lic
		--  MALE and FEMALE accounts are relevant for FUR FARM and GAME FARM
		left join mal_licence_species_vw spec
		on lic.licence_id = spec.licence_id
		where lic.licence_type_id = ip_licence_type_id
		group by lic.licence_type)
	--
	--  MAIN QUERY
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
		null,
		null,
		'LICENCE_LOCATION',
		json_build_object('DateTime',       to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Type',   licence_type,
						  'Licence',        licence_json,
						  'RowCount',       num_rows) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;
  
--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_TANK_RECHECK
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_dairy_farm_tank_recheck(
    IN    ip_recheck_year character varying,
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with tank_details as (
		select 
			json_agg(json_build_object('IRMA_Num',                irma_number,
									   'LicenceHolderCompany',    derived_licence_holder_name,
									   'YearToCheck',             recheck_year,
									   'TankCalibrationDate',     calibration_date,
									   'TankCompany',             company_name,
									   'TankModel',               model_number,
									   'TankSerialNo',            serial_number,
									   'TankCapacity',            tank_capacity)) tank_json,
			count(*) num_tanks
		from mal_dairy_farm_tank_vw
		where recheck_year = ip_recheck_year)
	--
	--  MAIN QUERY
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
		null,
		null,
		'DAIRY_FARM_TANK',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
						  'RecheckYear',         ip_recheck_year,
						  'Reg',                 tank_json,
						  'Total_Num_Tanks',   num_tanks) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from tank_details;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

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
-- PROCEDURE:  PR_START_PRINT_JOB
--

CREATE OR REPLACE PROCEDURE pr_start_print_job(
    IN    ip_print_category character varying, 
    INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  begin
	-- Start a row in the mal_print_job table
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
		dairy_infraction_json_count,
		report_json_count,
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
		0,
		0,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp)
	returning id into iop_print_job_id;
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
	update mal_dairy_farm_test_job 
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
