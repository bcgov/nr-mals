SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;
	

--        MALS-1181 - Apiary Site Report - including inactive and expired licenses
--          Added criteria to include only active licences.
--        MALS-1128 - Entire Province Needs to be an option in reports
--          Added criteria for 'ALL', to return data for all Regions

--
-- VIEW:  MAL_APIARY_PRODUCER_VW
--

DROP VIEW IF EXISTS mal_apiary_producer_vw CASCADE;

CREATE OR REPLACE VIEW mal_apiary_producer_vw as 
	select site.id site_id,
		lic.id licence_id,
		lic.licence_number,
		lic_stat.code_name licence_status,
		site_stat.code_name site_status,
		site.apiary_site_id,
		reg.id registrant_id,
		reg.last_name registrant_last_name,
		reg.first_name registrant_first_name,
		reg.primary_phone registrant_primary_phone,
		reg.email_address registrant_email_address,	
		lic.region_id site_region_id,
		rgn.region_name site_region_name,
		lic.regional_district_id site_regional_district_id,
		dist.district_name site_district_name,
		trim(concat(site.address_line_1 , ' ', site.address_line_2)) site_address,
		site.city site_city,
		site.primary_phone site_primary_phone,
		site.registration_date,
	    lic.total_hives licence_hive_count,
	    site.hive_count site_hive_count
	from mals_app.mal_licence lic
	inner join mal_registrant reg
	on lic.primary_registrant_id = reg.id
	inner join mal_site site
	on lic.id = site.licence_id
	inner join mal_licence_type_lu lictyp
	on lic.licence_type_id = lictyp.id
	inner join mal_region_lu rgn
	on site.region_id = rgn.id
	inner join mal_regional_district_lu dist
	on site.regional_district_id = dist.id
	left join mals_app.mal_status_code_lu lic_stat
	on lic.status_code_id = lic_stat.id
	left join mals_app.mal_status_code_lu site_stat
	on site.status_code_id = site_stat.id
	where lictyp.licence_type = 'APIARY';
	
 

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_APIARY_SITE
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_apiary_site(
    IN    ip_region_name character varying,
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
				json_agg(json_build_object('RegionName',          site_region_name,
										   'DistrictName',        site_district_name,
										   'LicenceNumber',       licence_number,
										   'LastName',            registrant_last_name,
										   'FirstName',           registrant_first_name,
										   'PrimaryPhone',        registrant_primary_phone,
										   'Email',               registrant_email_address,
										   'Num_Colonies',        site_hive_count,
										   'Address',             site_address,
										   'City',                site_city,
										   'Registration_Date',   registration_date,										   
										   'Num_Hives',           licence_hive_count)
			                                order by licence_number) licence_json,
				count(licence_number) total_producers,
				sum(licence_hive_count) total_hives
			from mal_apiary_producer_vw
			where 
				(site_region_name = ip_region_name or
				  ip_region_name = 'ALL')
			and licence_status = 'ACT'
			and site_status = 'ACT')
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
		'APIARY',
		null,
		'APIARY_SITE', 
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Reg',                licence_json,
						  'Tot_Producers',      total_producers,
						  'Tot_Hives',          total_hives) report_json,
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


--        MALS-1189 - Producer Analysis Report by Region not calculating correctly
--          Added criteria to restrict to Active licences, in addition to the existing Active Sites criteria.
--          Changed the calculations to count Producres by Registrant, instead of Licence.
--        MALS-1190 - Entire Province Needs to be an option in reports
--          Modified buckets threshold from 25 to 20.


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
										   'Num_Hives',             site_hive_count)
			                                order by licence_number) licence_json,
				count(licence_number) num_producers,
				sum(site_hive_count) num_hives
			from mal_apiary_producer_vw
			where site_city = ip_city
			and licence_status = 'ACT'
			and site_status = 'ACT'
			and site_hive_count between ip_min_hives and ip_max_hives)
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
		'APIARY',
		null,
		'APIARY_PRODUCER_CITY',
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
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
	with registrant_summary as (
			select registrant_id,
				site_regional_district_id,
				--count(*) num_sites,
				sum(site_hive_count) num_hives,
				count(case when site_hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			where licence_status = 'ACT'
			and site_status = 'ACT'
			group by registrant_id,
				site_regional_district_id),
		district_summary as (
			select coalesce(dist.district_name, 'No Region Specified') district_name,
				count(case when num_hives between 1 and  9 then 1 else null end) num_registrants_1to9,
				count(case when num_hives >= 10            then 1 else null end) num_registrants_10plus,
				count(case when num_hives between 1 and 19 then 1 else null end) num_registrants_1to19,
				count(case when num_hives >= 20            then 1 else null end) num_registrants_20plus,
				count(*) num_registrants,
				sum(case when num_hives between 1 and  9 then num_hives else 0 end) num_hives_1to9,
				sum(case when num_hives >= 10            then num_hives else 0 end) num_hives_10plus,
				sum(case when num_hives between 1 and 19 then num_hives else 0 end) num_hives_1to19,
				sum(case when num_hives >= 20            then num_hives else 0 end) num_hives_20plus,
				sum(num_hives) num_hives,
				sum(num_producers_hives_0) num_producers_hives_0
			from registrant_summary rs
			left join mal_regional_district_lu dist
			on rs.site_regional_district_id = dist.id
			group by dist.district_name),
		report_summary as (
			select 
				json_agg(json_build_object('DistrictName',       district_name,
										   'Producers1To9',      num_registrants_1to9,
										   'Producers10Plus',    num_registrants_10plus,
										   'Producers1To19',     num_registrants_1to19,
										   'Producers20Plus',    num_registrants_20plus,
										   'ProducersTotal',     num_registrants,
										   'Colonies1To9',       num_hives_1to9,
										   'Colonies10Plus',     num_hives_10plus,	
										   'Colonies1To19',      num_hives_1to19,
										   'Colonies20Plus',     num_hives_20plus,										   
										   'ColoniesTotal',      num_hives)
			                                order by district_name) district_json,
				sum(num_registrants_1to9)    total_registrants_1To9,
				sum(num_registrants_10plus)  total_registrants_10Plus,
				sum(num_registrants_1to19)   total_registrants_1To19,
				sum(num_registrants_20plus)  total_registrants_20Plus,
				sum(num_registrants)         total_registrants,
				sum(num_hives_1to9)          total_hives_1To9,
				sum(num_hives_10plus)        total_hives_10Plus,
				sum(num_hives_1to19)         total_hives_1To19,
				sum(num_hives_20plus)        total_hives_20Plus,
				sum(num_hives)               total_hives,
				sum(num_producers_hives_0)   total_producers_hives_0
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
		'APIARY',
		null,
		'APIARY_PRODUCER_DISTRICT',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'District',                  district_json,
						  'TotalProducers1To9',        total_registrants_1To9,
						  'TotalProducers10Plus',      total_registrants_10Plus,
						  'TotalProducers1To19',       total_registrants_1To19,
						  'TotalProducers20Plus',      total_registrants_20Plus,
						  'TotalNumProducers',         total_registrants,
						  'TotalColonies1To9',         total_hives_1To9,
						  'TotalColonies10Plus',       total_hives_10Plus,
						  'TotalColonies1To19',        total_hives_1To19,
						  'TotalColonies20Plus',       total_hives_20Plus,
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
	with registrant_summary as (
			select registrant_id,
				site_region_id,
				--count(*) num_sites,
				sum(site_hive_count) num_hives,
				count(case when site_hive_count = 0 then 1 else null end) num_producers_hives_0
			from mal_apiary_producer_vw 
			where licence_status = 'ACT'
			and site_status = 'ACT'
			group by registrant_id,
				site_region_id),
		region_summary as (
			select coalesce(rgn.region_name, 'No Region Specified') region_name,
				count(case when num_hives between 1 and  9 then 1 else null end) num_registrants_1to9,
				count(case when num_hives >= 10            then 1 else null end) num_registrants_10plus,
				count(case when num_hives between 1 and 19 then 1 else null end) num_registrants_1to19,
				count(case when num_hives >= 20            then 1 else null end) num_registrants_20plus,
				count(*) num_registrants,
				sum(case when num_hives between 1 and  9 then num_hives else 0 end) num_hives_1to9,
				sum(case when num_hives >= 10            then num_hives else 0 end) num_hives_10plus,
				sum(case when num_hives between 1 and 19 then num_hives else 0 end) num_hives_1to19,
				sum(case when num_hives >= 20            then num_hives else 0 end) num_hives_20plus,
				sum(num_hives) num_hives,
				sum(num_producers_hives_0) num_producers_hives_0
			from registrant_summary rs
			left join mal_region_lu rgn
			on rs.site_region_id = rgn.id
			group by rgn.region_name),
		report_summary as (
			select 
				json_agg(json_build_object('RegionName',       region_name,
										   'Producers1To9',      num_registrants_1to9,
										   'Producers10Plus',    num_registrants_10plus,
										   'Producers1To19',     num_registrants_1to19,
										   'Producers20Plus',    num_registrants_20plus,
										   'ProducersTotal',     num_registrants,
										   'Colonies1To9',       num_hives_1to9,
										   'Colonies10Plus',     num_hives_10plus,	
										   'Colonies1To19',      num_hives_1to19,
										   'Colonies20Plus',     num_hives_20plus,										   
										   'ColoniesTotal',      num_hives)
			                                order by region_name) region_json,
				sum(num_registrants_1to9)   total_registrants_1To9,
				sum(num_registrants_10plus) total_registrants_10Plus,
				sum(num_registrants_1to19)  total_registrants_1To19,
				sum(num_registrants_20plus) total_registrants_20Plus,
				sum(num_registrants)        total_registrants,
				sum(num_hives_1to9)         total_hives_1To9,
				sum(num_hives_10plus)       total_hives_10Plus,
				sum(num_hives_1to19)        total_hives_1To19,
				sum(num_hives_20plus)       total_hives_20Plus,
				sum(num_hives)              total_hives,
				sum(num_producers_hives_0)  total_producers_hives_0
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
		'APIARY',
		null,
		'APIARY_PRODUCER_REGION',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Region',                    region_json,
						  'TotalProducers1To9',        total_registrants_1To9,
						  'TotalProducers10Plus',      total_registrants_10Plus,
						  'TotalProducers1To19',       total_registrants_1To19,
						  'TotalProducers20Plus',      total_registrants_20Plus,
						  'TotalNumProducers',         total_registrants,
						  'TotalColonies1To9',         total_hives_1To9,
						  'TotalColonies10Plus',       total_hives_10Plus,
						  'TotalColonies1To19',        total_hives_1To19,
						  'TotalColonies20Plus',       total_hives_20Plus,
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


--        MALS-1163 - Dairy - Multiple Tanks - reversing order on certificate creation
--          Added column tank_create_timestamp to the view, and to the sotr in the procedure.
--        MALS-1167 - Dairy Client Details Report pulling incorrect site information
--          Added SiteStatus tthe JSON output to provide filtering capabilities in Excel.

--
-- VIEW:  MAL_DAIRY_FARM_TANK_VW
--

DROP VIEW IF EXISTS mal_dairy_farm_tank_vw CASCADE;

CREATE OR REPLACE VIEW mal_dairy_farm_tank_vw as
	select dft.id dairy_farm_tank_id,
		site_id,
		lic.id licence_id,
		lic.licence_number,
		lic.irma_number,
		licstat.code_name licence_status,
		lic.company_name,
	    -- Consider the Company Name Override flag to determine the Licence Holder name.
	    case 
		  when lic.company_name_override and lic.company_name is not null 
		  then lic.company_name
		  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
		end derived_licence_holder_name,
			case when reg.first_name is not null 
		      and reg.last_name is not null then 
	          	concat(reg.last_name, ', ', reg.first_name)
             else 
                  coalesce(reg.last_name, reg.first_name)
        end registrant_last_first,        
		trim(concat(lic.address_line_1 , ' ', lic.address_line_2)) address,
		lic.city,
		lic.province,
		lic.postal_code,
		reg.primary_phone registrant_primary_phone,
		reg.secondary_phone registrant_secondary_phone,
		reg.fax_number registrant_fax_number,	
		reg.email_address registrant_email_address,	
		lic.issue_date,
		to_char(lic.issue_date, 'FMMonth dd, yyyy') issue_date_display,
		sitestat.code_name site_status,
		trim(concat(site.address_line_1 , ' ', site.address_line_2)) site_address,
		site.city site_city,
		site.province site_province,
		site.postal_code site_postal_code,
		site.inspector_name,
		site.inspection_date,
		dft.calibration_date,
		to_char(dft.calibration_date, 'FMMonth dd, yyyy') calibration_date_display,
		dft.company_name tank_company_name,
		dft.model_number tank_model_number,
		dft.serial_number tank_serial_number,
		dft.tank_capacity,
		dft.recheck_year,
		dft.create_timestamp tank_create_timestamp
	from mal_licence lic
	inner join mal_licence_type_lu lictyp
	on lic.licence_type_id = lictyp.id
	inner join mal_status_code_lu licstat
	on lic.status_code_id = licstat.id 
	inner join mal_registrant reg
	on lic.primary_registrant_id = reg.id
	inner join mal_site site 
	on lic.id = site.licence_id
	inner join mal_dairy_farm_tank dft
	on site.id = dft.site_id
	inner join mal_status_code_lu sitestat
	on lic.status_code_id = sitestat.id ;
	

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_DETAILS
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_dairy_farm_details(
    IN    ip_irma_number character varying,
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
	with tank_details as (
		select licence_id,
			json_agg(json_build_object('Date',  to_char(greatest(spc1_date,scc_date,cry_date,ffa_date,ih_date), 'fmyyyy-mm-dd'),
									   'IBC',   spc1_value,
									   'SCC',   scc_value,
									   'CRY',   cry_value,
									   'FFA',   ffa_value,
									   'IH',    ih_value)
		                                order by greatest(spc1_date,scc_date,cry_date,ffa_date,ih_date)) test_json,
		    avg(spc1_value) average_spc1,
		    avg(scc_value) average_scc,
		    avg(cry_value) average_cry,
		    avg(ffa_value) average_ffa,
		    avg(ih_value) average_ih
		from mal_dairy_farm_test_result
		where irma_number = ip_irma_number
		and greatest(spc1_date,scc_date,cry_date,ffa_date,ih_date) 
			between ip_start_date and ip_end_date  
		group by licence_id
		),
	licence_details as (
		select 
			json_agg(json_build_object('IRMA_NUM',               tank.irma_number,
										'Status',                tank.licence_status,
										'LicenceHolderCompany',  tank.company_name,
										'LastnameFirstName',     tank.registrant_last_first,
										'Address',               tank.address,
										'City',                  tank.city,
										'Province',              tank.province,
										'Postcode',              tank.postal_code,
										'Phone',                 tank.registrant_primary_phone,
										'Fax',                   tank.registrant_fax_number,
										'Cell',                  tank.registrant_secondary_phone,
										'Email',                 tank.registrant_email_address,
										'IssueDate',             tank.issue_date_display,
										'SiteStatus',            tank.site_status,
										'SiteAddress',           tank.site_address,
										'SiteCity',              tank.site_city,
										'SiteProvince',          tank.site_province,
										'SitePostcode',          tank.site_postal_code,
										'TankCompany',           tank.tank_company_name,
										'TankModel',             tank.tank_model_number,
										'TankSerial',            tank.tank_serial_number,
										'TankCapacity',          tank.tank_capacity,
										'LastInspectionDate',    to_char(tank.inspection_date, 'fmyyyy-mm-dd hh24mi'),
										'LastInspector',         tank.inspector_name,
										'Insp',                  dtl.test_json,
										'Avg_IBC',               to_char(dtl.average_spc1,'fm9999990.0'),
										'Avg_SCC',               to_char(dtl.average_scc,'fm9999990.0'),
										'Avg_CRY',               to_char(dtl.average_cry,'fm9999990.0'),
										'Avg_FFA',               to_char(dtl.average_ffa,'fm9999990.0'),
										'Avg_IH',                to_char(dtl.average_ih,'fm9999990.0'))
		                                order by licence_number, tank_create_timestamp) licence_json
		from mal_dairy_farm_tank_vw tank
		left join tank_details dtl
		on tank.licence_id = dtl.licence_id
		where tank.irma_number = ip_irma_number
		)
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
		'DAIRY FARM',
		null,
		'DAIRY_FARM_DETAIL',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'DateRangeStart',      to_char(ip_start_date, 'fmyyyy-mm-dd'),
						  'DateRangeEnd',        to_char(ip_end_date, 'fmyyyy-mm-dd'),
						  'Client',              licence_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_details;
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


--        MALS-59 - Expiry Date Report including "INACTIVE" licenses
--          Update pr_generate_print_json_licence_expiry to restrict on ACT licences.

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_LICENCE_EXPIRY
--

CREATE OR REPLACE PROCEDURE pr_generate_print_json_licence_expiry(
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
	with licence_details as (
		select 
			json_agg(json_build_object('LicenceNumber',          licence_number,
										'Lastname',              last_name,
										'FirstName',             first_name,
										'LicenceHolderCompany',  company_name,
										'PrimaryPhone',          primary_phone,
										'Email',                 email_address,
										'LicenceType',           licence_type,
										'IssueDate',             to_char(issue_date, 'fmyyyy-mm-dd'),
										'ExpiryDate',            to_char(expiry_date, 'fmyyyy-mm-dd'))
		                                order by licence_number) licence_json
		from mals_app.mal_licence_summary_vw	
		where licence_type != 'APIARY'
		and licence_status = 'Active'
		and expiry_date between ip_start_date and ip_end_date
		)
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
		'LICENCE_EXPIRY',
		json_build_object('DateTime',        to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
						  'DateRangeStart',  to_char(ip_start_date, 'fmyyyy-mm-dd'),
						  'DateRangeEnd',    to_char(ip_end_date, 'fmyyyy-mm-dd'),
						  'Reg',             licence_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_details;
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