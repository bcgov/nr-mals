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
--          Added column tank_create_timestamp to the view, and to the sort in the procedure.
--        MALS-1167 - Dairy Client Details Report pulling incorrect site information
--          Added SiteStatus tthe JSON output to provide filtering capabilities in Excel.

--
-- VIEW:  MAL_DAIRY_FARM_TANK_VW
--

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


--        MALS-1203 - Livestock Dealer Agent showing wrong Livestock Dealer Association
--          Added AgentFor to the JSON output
--        MALS-1184 - Livestock Dealer Agent Card - incorrect
--          Replaced registrant_name with company_name for the LIVESTOCK DEALER AGENT LicenceHolderName

--
-- VIEW:  MAL_PRINT_CARD_VW
--

CREATE OR REPLACE VIEW mals_app.mal_print_card_vw as
	WITH licence_base AS (
		SELECT lictyp.licence_type,
			lic.company_name,
			COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS derived_company_name,
			NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text) AS registrant_name,
			CASE
				WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
				ELSE COALESCE(reg.last_name, reg.first_name)
			END AS registrant_last_first,
			CASE
				WHEN prnt_lic.company_name_override AND prnt_lic.company_name IS NOT NULL THEN prnt_lic.company_name::text
				ELSE NULLIF(btrim(concat(prnt_reg.first_name, ' ', prnt_reg.last_name)), ''::text)
			END AS derived_parent_licence_holder_name,
			lic.licence_number::character varying AS licence_number,
			lic.issue_date,
			lic.expiry_date,
			to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display
		FROM mals_app.mal_licence lic
		JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
		JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
		JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
		LEFT JOIN mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
		LEFT JOIN mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
		LEFT JOIN mal_registrant prnt_reg ON prnt_lic.primary_registrant_id = prnt_reg.id
		WHERE lic.print_certificate = true 
		AND licstat.code_name::text = 'ACT'::text
		)
	SELECT licence_base.licence_type,
		CASE licence_base.licence_type
			WHEN 'BULK TANK MILK GRADER'::text THEN 
				json_agg(json_build_object(
					'CardLabel', 'Bulk Tank Milk Grader''s Identification Card', 
					'LicenceHolderCompany', licence_base.company_name, 
					'LicenceHolderName', licence_base.registrant_name, 
					'LicenceNumber', licence_base.licence_number, 
					'ExpiryDate', licence_base.expiry_date_display) 
				ORDER BY licence_base.company_name, licence_base.licence_number)
			WHEN 'LIVESTOCK DEALER AGENT'::text THEN 
				json_agg(json_build_object(
					'CardType', 'Livestock Dealer Agent''s Identification Card', 
					'LicenceHolderName', licence_base.company_name, 
					'LastFirstName', licence_base.registrant_last_first, 
					'AgentFor', licence_base.derived_parent_licence_holder_name, 
					'LicenceNumber', licence_base.licence_number, 
					'StartDate', to_char(GREATEST(licence_base.issue_date::timestamp with time zone, date_trunc('year'::text, licence_base.expiry_date::timestamp with time zone) - '9 mons'::interval), 'FMMonth dd, yyyy'::text), 
					'ExpiryDate', licence_base.expiry_date_display) 
				ORDER BY licence_base.registrant_name, licence_base.licence_number)
			WHEN 'LIVESTOCK DEALER'::text THEN 
				json_agg(json_build_object(
					'CardType', 'Livestock Dealer''s Identification Card', 
					'LicenceHolderCompany', licence_base.derived_company_name, 
					'LicenceNumber', licence_base.licence_number, 
					'StartDate', to_char(GREATEST(licence_base.issue_date::timestamp with time zone, date_trunc('year'::text, licence_base.expiry_date::timestamp with time zone) - '9 mons'::interval), 'FMMonth dd, yyyy'::text), 
					'ExpiryDate', licence_base.expiry_date_display) 
				ORDER BY licence_base.derived_company_name, licence_base.licence_number)
		ELSE NULL::json
		END AS card_json
	FROM licence_base
	WHERE licence_base.licence_type::text = ANY (ARRAY['BULK TANK MILK GRADER'::character varying::text, 
	'LIVESTOCK DEALER AGENT'::character varying::text, 
	'LIVESTOCK DEALER'::character varying::text])
GROUP BY licence_base.licence_type;
  


--        MALS-1207 - Apiary Premises ID - update not functioning
--          Removed duplicate assignment of the total_hives clumn in the Update section

--
-- PROCEDURE:  PR_PROCESS_PREMISES_IMPORT
--

CREATE OR REPLACE PROCEDURE mals_app.pr_process_premises_import(ip_job_id integer, INOUT iop_job_status character varying, INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_apiary_type_id          integer;
	l_active_status_id        integer;
	l_file_rec                record;
	l_num_file_rows           integer := 0;
	l_num_file_inserts        integer := 0;
	l_num_file_updates        integer := 0;
	l_num_file_do_not_imports integer := 0;
	l_num_db_inserts          integer := 0;
	l_num_db_updates          integer := 0;
	-- 
	l_licence_id              integer;
	l_licence_number          integer;
	l_site_id                 integer;
	l_apiary_site_id          integer;
	l_registrant_id           integer;
	l_process_comments        varchar(2000);
	l_error_sqlstate          text;
	l_error_message           text;
	l_error_context           text;
  --
  begin
	--
	select 
		count(*) as num_file_rows,
		count(case when import_action in ('NEW_LICENCE', 'NEW_SITE') then 1 else null end) num_file_inserts,
		count(case when import_action = 'UPDATE' then 1 else null end) num_file_updates,
		count(case when import_action = 'DO_NOT_IMPORT' then 1 else null end) num_do_not_imports
	into l_num_file_rows, l_num_file_inserts, l_num_file_updates, l_num_file_do_not_imports
	from mal_premises_detail
	where premises_job_id = ip_job_id;
raise notice 'num_file_rows (%)', l_num_file_rows;
	update mal_premises_job
		set source_row_count = l_num_file_rows,
			source_insert_count = l_num_file_inserts,
			source_update_count = l_num_file_updates,
			source_do_not_import_count = l_num_file_do_not_imports
	where id = ip_job_id;
	--
	select id
	into l_apiary_type_id
	from mal_licence_type_lu
	where licence_type = 'APIARY';
	select id
	into l_active_status_id
	from mal_status_code_lu
	where code_name = 'ACT';
	--
	for l_file_rec in 
		select 
			p.id,
			p.apiary_site_id,
			p.import_action, 
			p.licence_number,
			p.licence_company_name,
			p.licence_mail_address_line_1,
			p.licence_mail_address_line_2,
			p.licence_mail_city,
			p.licence_mail_province,
			p.licence_mail_postal_code,
			p.licence_total_hives,
			p.source_premises_id,
			p.site_address_line_1,
			r.id as region_id,
			p.site_region_name,
			d.id as regional_district_id,
			p.site_regional_district_name,
			p.registrant_first_name,
			p.registrant_last_name,
			p.registrant_primary_phone,
			p.registrant_secondary_phone,
			p.registrant_fax_number,
			p.registrant_email_address,
			p.process_comments
		from mal_premises_detail p
		left join mal_region_lu r
		on p.site_region_name = r.region_name
		left join mal_regional_district_lu d
		on p.site_regional_district_name = d.district_name	
		where p.premises_job_id = ip_job_id 
		and p.import_status = 'PENDING' loop
			l_licence_id            := null;
			l_licence_number        := null;
			l_site_id               := null;
			l_apiary_site_id        := null;
			l_registrant_id         := null;
			l_process_comments      := null;
			l_error_message         := null;
			begin
	--  DO_NOT_IMPORT
				--
				if l_file_rec.import_action in ('DO_NOT_IMPORT') then
				-- Mark the Do Not Import rows.
					update mal_premises_detail
						set import_status    = 'NO_ACTION',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  'This row was marked as DO_NOT_IMPORT and was therefore not processed.')
						where id = l_file_rec.id;
	--  NEW_LICENCE (and Site, and Registrant)
				-- Process new licences and sites
				elsif l_file_rec.import_action in ('NEW_LICENCE' ) then
					-- Create a new Licence.
					insert into mal_licence(
						licence_type_id,
						status_code_id,
						region_id,
						regional_district_id,
						company_name,
						mail_address_line_1,
						mail_address_line_2,
						mail_city,
						mail_province,
						mail_postal_code,
						application_date,
						issue_date,
						expiry_date,
						total_hives
						)
						values(
							l_apiary_type_id,
							l_active_status_id,
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_file_rec.licence_company_name,
							l_file_rec.licence_mail_address_line_1,
							l_file_rec.licence_mail_address_line_2,
							l_file_rec.licence_mail_city,
							l_file_rec.licence_mail_province,
							l_file_rec.licence_mail_postal_code,
							current_date,  -- application_date,
							current_date,  -- issue_date,
							current_date + interval '2 years',  -- expiry_date,
							l_file_rec.licence_total_hives
							)
							returning id, licence_number into l_licence_id, l_licence_number;
					-- First apiary site ID for new licence.
					l_apiary_site_id = 100;
					--  Create a new Site.
					insert into mal_site (
						licence_id,
						apiary_site_id,
						region_id,
						regional_district_id,
						status_code_id,
						address_line_1,							
						premises_id
						)
						values (
							l_licence_id,
							l_apiary_site_id,   
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_active_status_id,
							l_file_rec.site_address_line_1,
							l_file_rec.source_premises_id)
						returning id into l_site_id;
					-- Create a new Registrant
					insert into mal_registrant(
						first_name,
						last_name,
						primary_phone,
						secondary_phone,
						fax_number,
						email_address)
						values(
							l_file_rec.registrant_first_name,
							l_file_rec.registrant_last_name,
							l_file_rec.registrant_primary_phone,
							l_file_rec.registrant_secondary_phone,
							l_file_rec.registrant_fax_number,
							l_file_rec.registrant_email_address
							)
							returning id into l_registrant_id;
					-- Add a reference to the new Registrant on the new Licence
					update mal_licence
						set primary_registrant_id = l_registrant_id
					where id = l_licence_id;
					-- Add a row to the cross reference table for the new licence and registrant.
					insert into mal_licence_registrant_xref(
						licence_id,
						registrant_id)
						values(
							l_licence_id,
							l_registrant_id
							);
					l_process_comments  = concat(l_file_rec.process_comments, 
												 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
												' This row was successfully processed. ');
					-- Update the imported row with the new Licence info.
					update mal_premises_detail
					set import_status            = 'SUCCESS',
						licence_id               = l_licence_id,
						licence_number           = l_licence_number,
						site_id                  = l_site_id,
						apiary_site_id           = l_apiary_site_id,
						registrant_id            = l_registrant_id,
						licence_action           = 'INSERT',
						licence_status           = 'SUCCESS',
						site_action              = 'INSERT',
						site_status              = 'SUCCESS',
						process_comments         = l_process_comments,
						licence_status_timestamp = current_timestamp,
						site_status_timestamp    = current_timestamp
					where id = l_file_rec.id;
					l_num_db_inserts = l_num_db_inserts + 1;
	--  NEW_SITE (existing Licence)
				-- New Site on exixsting Licence
				elsif l_file_rec.import_action in ('NEW_SITE') then
					--  Determine if the Licence exists
					select id
					into l_licence_id
					from mal_licence
					where licence_number = l_file_rec.licence_number;
					if l_licence_id is not null then
						-- Determine the next sequential apiary Site ID
						select coalesce(max(apiary_site_id) + 1, 100)
						into l_apiary_site_id
						from mal_site
						where licence_id = l_licence_id;
						--  Create a new Site.
						insert into mal_site (
							licence_id,
							apiary_site_id,
							region_id,
							regional_district_id,
							status_code_id,
							address_line_1,							
							premises_id
							)
							values (
								l_licence_id,
								l_apiary_site_id,
								l_file_rec.region_id,
								l_file_rec.regional_district_id,
								l_active_status_id,
								l_file_rec.site_address_line_1,
								l_file_rec.source_premises_id)
							returning id into l_site_id;
						-- Update the Licence expiry date.
						update mal_licence
							set expiry_date = current_date + interval '2 years'
						where id = l_licence_id;
						l_process_comments  = concat(l_file_rec.process_comments, 
													 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
													' This row was successfully processed. ');
						-- Update the file row with the new IDs.
						update mal_premises_detail
						set import_status         = 'SUCCESS',
							licence_id            = l_licence_id,
							site_id               = l_site_id,
							apiary_site_id        = l_apiary_site_id,
							site_action           = 'INSERT',
							site_status           = 'SUCCESS',
							process_comments      = l_process_comments,
							site_status_timestamp = current_timestamp
						where id = l_file_rec.id;
						l_num_db_inserts = l_num_db_inserts + 1;
					else
						l_process_comments  = concat(l_file_rec.process_comments, 
													 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
													 ' The licence number ', l_licence_number, ' was not found in the Licence table. ');
						update mal_premises_detail
							set import_status    = 'NO_ACTION',
								process_comments = l_process_comments
							where id = l_file_rec.id;
						
					end if;
		--  UPDATE (Licence and Site)
				-- Process updates to licences and sites
				elsif l_file_rec.import_action in ('UPDATE') then
					select l.id, s.id
					into l_licence_id, l_site_id
					from mal_licence l
					left join mal_site s 
					on l.id = s.licence_id
					inner join mal_licence_type_lu t
					on l.licence_type_id = t.id
					inner join mal_status_code_lu st
					on s.status_code_id = st.id
					where t.licence_type = 'APIARY'
					and st.code_name = 'ACT'
					and l.licence_number = l_file_rec.licence_number
					and s.apiary_site_id = l_file_rec.apiary_site_id;
					if l_site_id is not null then
						update mal_licence
							set region_id            = l_file_rec.region_id,
								regional_district_id = l_file_rec.regional_district_id,
								company_name         = l_file_rec.licence_company_name,
								mail_address_line_1  = l_file_rec.licence_mail_address_line_1,
								mail_address_line_2  = l_file_rec.licence_mail_address_line_2,
								mail_city            = l_file_rec.licence_mail_city,
								mail_province        = l_file_rec.licence_mail_province,
								mail_postal_code     = l_file_rec.licence_mail_postal_code,	
								issue_date           = current_date,
								expiry_date          = current_date + interval '2 years',
							    total_hives          = l_file_rec.licence_total_hives
							where id = l_licence_id;
						update mal_site
							set region_id            = l_file_rec.region_id,
								regional_district_id = l_file_rec.regional_district_id,
								address_line_1       = l_file_rec.site_address_line_1,
								premises_id          = l_file_rec.source_premises_id
							where id = l_site_id;	
						update mal_premises_detail
							set licence_id       = l_licence_id,
								site_id          = l_site_id,
								import_status    = 'SUCCESS',
								process_comments = concat(process_comments, 
														  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
														  'The Licence and Site were successfully updated.')
							where id = l_file_rec.id;
					l_num_db_updates = l_num_db_updates + 1;
					else
						update mal_premises_detail
							set import_status    = 'NO_ACTION',
								process_comments = concat(process_comments, 
														  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
														  'No data was found for the Licence Number and/or Apiary Site ID provided.')
							where id = l_file_rec.id;
					end if;
				--
				else
				-- The import action is invalid
					update mal_premises_detail
						set import_status    = 'NO_ACTION',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  'The information supplied on this row is not a valid request.')
						where id = l_file_rec.id;			
				end if;				
			exception
				when others then
	                get stacked diagnostics l_error_message = MESSAGE_TEXT;
					l_process_comments  = concat(l_file_rec.process_comments, 
												 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
												' An error was made while processing this row. ');
					update mal_premises_detail
						set import_status    = 'ERROR',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  l_error_sqlstate, ' ',
													  l_error_message, ' ',
													  l_error_context)
						where id = l_file_rec.id;
					commit;
			end;
		end loop;
	--	
	-- Capture existing process comments, in case this is not the first time this row was processed.
	case 
		when l_num_file_inserts = l_num_db_inserts
		 and l_num_file_updates = l_num_db_updates
		then iop_job_status = 'SUCCESS';
			 iop_process_comments = 'The rows were successfully processed.';
		else iop_job_status = 'WARNING'; 
			 iop_process_comments = 'One or more of the rows was not successfully processed. Check the mal_premises_detail table.';
	end case;
	-- Update the Job table.
	update mal_premises_job 
		set
			job_status              = iop_job_status,
			target_insert_count     = l_num_db_inserts,
			target_update_count     = l_num_db_updates,
			execution_end_time      = current_timestamp,
			execution_comment       = iop_process_comments,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
	-- 
end; 
$procedure$
;


--        MALS-1163 - Dairy - Multiple Tanks - reversing order on certificate creation
--          Changed tank_json ORDER BY from ORDER BY "t.serial_number, t.calibration_date" to "tank.create_timestamp"
--        MALS-1204 - Livestock Dealer incorrect company name vs name of nominee
--          Updated the JSON output for LIVESTOCK DEALER to source 'LicenceHolderName' from company_name.

--
-- VIEW:  MAL_PRINT_CERTIFICATE_VW
--

 CREATE OR REPLACE VIEW mals_app.mal_print_certificate_vw
AS WITH licence_base AS (
         SELECT lic.id AS licence_id,
            lic.licence_number,
            prnt_lic.licence_number AS parent_licence_number,
            lictyp.licence_type,
            spec.code_name AS species_description,
            lictyp.legislation AS licence_type_legislation,
            licstat.code_name AS licence_status,
            reg.first_name AS registrant_first_name,
            reg.last_name AS registrant_last_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS company_name,
            NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
            reg.official_title,
                CASE
                    WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name::text
                    ELSE NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)
                END AS derived_licence_holder_name,
                CASE
                    WHEN prnt_lic.company_name_override AND prnt_lic.company_name IS NOT NULL THEN prnt_lic.company_name::text
                    ELSE NULLIF(btrim(concat(prnt_reg.first_name, ' ', prnt_reg.last_name)), ''::text)
                END AS derived_parent_licence_holder_name,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_mailing_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_mailing_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_mailing_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_mailing_postal_code,
            lic.issue_date,
            to_char(lic.issue_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS issue_date_display,
            lic.reissue_date,
            to_char(lic.reissue_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS reissue_date_display,
            lic.expiry_date,
            to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display,
            lic.bond_number,
            lic.bond_value,
            lic.bond_carrier_name,
            lic.irma_number,
            lic.total_hives,
            reg.primary_phone,
                CASE
                    WHEN reg.primary_phone IS NULL THEN NULL::text
                    ELSE concat('(', substr(reg.primary_phone::text, 1, 3), ') ', substr(reg.primary_phone::text, 4, 3), '-', substr(reg.primary_phone::text, 7, 4))
                END AS registrant_primary_phone_display,
            reg.email_address,
            lic.print_certificate
           FROM mals_app.mal_licence lic
             JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
             LEFT JOIN mals_app.mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
             LEFT JOIN mals_app.mal_registrant prnt_reg ON prnt_lic.primary_registrant_id = prnt_reg.id
             LEFT JOIN mals_app.mal_licence_species_code_lu spec ON lic.species_code_id = spec.id
             LEFT JOIN mals_app.mal_licence_type_lu sp_lt ON spec.licence_type_id = sp_lt.id
          WHERE lic.print_certificate = true
        ), active_site AS (
         SELECT s.id AS site_id,
            l.id AS licence_id,
            l_t.licence_type,
            s.apiary_site_id,
            concat(l.licence_number, '-', s.apiary_site_id) AS registration_number,
            btrim(concat(s.address_line_1, ' ', s.address_line_2)) AS address_1_2,
            btrim(concat(s.address_line_1, ' ', s.address_line_2, ' ', s.city, ' ', s.province, ' ', s.postal_code)) AS full_address,
            s.city,
            to_char(s.registration_date, 'yyyy/mm/dd'::text) AS registration_date,
            s.legal_description,
            s.site_details,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mals_app.mal_licence l
             JOIN mals_app.mal_site s ON l.id = s.licence_id
             JOIN mals_app.mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mals_app.mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE stat.code_name::text = 'ACT'::text AND l.print_certificate = true
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address_1_2, 'City', active_site.city, 'RegDate', active_site.registration_date) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dairy_tank AS (
         SELECT ast.licence_id,
            json_agg(json_build_object('DairyTankCompany', t.company_name, 'DairyTankModel', t.model_number, 'DairyTankSN', t.serial_number, 'DairyTankCapacity', t.tank_capacity, 'DairyTankCalibrationDate', to_char(t.calibration_date, 'yyyy/mm/dd'::text)) ORDER BY t.create_timestamp) AS tank_json
           FROM active_site ast
             JOIN mals_app.mal_dairy_farm_tank t ON ast.site_id = t.site_id
          GROUP BY ast.licence_id
        )
 SELECT base.licence_type,
    base.licence_number,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'TotalColonies', base.total_hives, 'ApiarySites', apiary.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'DAIRY FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ReIssueDate', base.reissue_date_display, 'SiteDetails', site.full_address, 'SiteInformation', tank.tank_json, 'IRMA_Num', base.irma_number)
            WHEN 'FUR FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'Species', base.species_description, 'SiteDetails', site.site_details)
            WHEN 'GAME FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'Species', base.species_description, 'LegalDescription', site.legal_description)
            WHEN 'HIDE DEALER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'LIMITED MEDICATED FEED'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'SiteDetails', site.site_details)
            WHEN 'LIVESTOCK DEALER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.company_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'Nominee', base.registrant_name)
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'AgentFor', base.derived_parent_licence_holder_name)
            WHEN 'MEDICATED FEED'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'LicenceHolderName', base.registrant_name, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'PUBLIC SALE YARD OPERATOR'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'LivestockDealerLicence', base.parent_licence_number, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'SaleYard', base.derived_parent_licence_holder_name)
            WHEN 'PURCHASE LIVE POULTRY'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'SiteDetails', site.site_details, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'BusinessAddressLocation',
            CASE
                WHEN base.derived_mailing_address = site.address_1_2 THEN NULL::text
                ELSE site.address_1_2
            END)
            WHEN 'SLAUGHTERHOUSE'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name)
            WHEN 'VETERINARY DRUG'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'DISPENSER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            ELSE NULL::json
        END AS certificate_json,
    json_build_object('RegistrantLastFirst', base.registrant_last_first, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code) AS envelope_json
   FROM licence_base base
     LEFT JOIN apiary_site apiary ON base.licence_id = apiary.licence_id
     LEFT JOIN active_site site ON base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dairy_tank tank ON base.licence_id = tank.licence_id
  WHERE 1 = 1 AND base.licence_status::text = 'ACT'::text;


--        MALS-1223 - Apiary / Premises ID load - can licenses be set to "print" automatically
--          Updated the mal_licence.print_certificate to true for NEW_LICENCE, NEW_SITE, and UPDATE.
--        MALS-1194 - Apiary Premises ID transfer didn't load correctly
--          Added site_city to populate mal_site.city, and 'BC' to populate mal_site.province.

--
-- PROCEDURE:  PR_PROCESS_PREMISES_IMPORT
--

alter table mal_premises_detail add column site_city varchar(35);

CREATE OR REPLACE PROCEDURE mals_app.pr_process_premises_import(IN ip_job_id integer, INOUT iop_job_status character varying, INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_apiary_type_id          integer;
	l_active_status_id        integer;
	l_file_rec                record;
	l_num_file_rows           integer := 0;
	l_num_file_inserts        integer := 0;
	l_num_file_updates        integer := 0;
	l_num_file_do_not_imports integer := 0;
	l_num_db_inserts          integer := 0;
	l_num_db_updates          integer := 0;
	-- 
	l_licence_id              integer;
	l_licence_number          integer;
	l_site_id                 integer;
	l_apiary_site_id          integer;
	l_registrant_id           integer;
	l_process_comments        varchar(2000);
	l_error_sqlstate          text;
	l_error_message           text;
	l_error_context           text;
  --
  begin
	--
	select 
		count(*) as num_file_rows,
		count(case when import_action in ('NEW_LICENCE', 'NEW_SITE') then 1 else null end) num_file_inserts,
		count(case when import_action = 'UPDATE' then 1 else null end) num_file_updates,
		count(case when import_action = 'DO_NOT_IMPORT' then 1 else null end) num_do_not_imports
	into l_num_file_rows, l_num_file_inserts, l_num_file_updates, l_num_file_do_not_imports
	from mal_premises_detail
	where premises_job_id = ip_job_id;
raise notice 'num_file_rows (%)', l_num_file_rows;
	update mal_premises_job
		set source_row_count = l_num_file_rows,
			source_insert_count = l_num_file_inserts,
			source_update_count = l_num_file_updates,
			source_do_not_import_count = l_num_file_do_not_imports
	where id = ip_job_id;
	--
	select id
	into l_apiary_type_id
	from mal_licence_type_lu
	where licence_type = 'APIARY';
	select id
	into l_active_status_id
	from mal_status_code_lu
	where code_name = 'ACT';
	--
	for l_file_rec in 
		select 
			p.id,
			p.apiary_site_id,
			p.import_action, 
			p.licence_number,
			p.licence_company_name,
			p.licence_mail_address_line_1,
			p.licence_mail_address_line_2,
			p.licence_mail_city,
			p.licence_mail_province,
			p.licence_mail_postal_code,
			p.licence_total_hives,
			p.source_premises_id,
			p.site_address_line_1,
			r.id as region_id,
			p.site_region_name,
			d.id as regional_district_id,
			p.site_regional_district_name,
			p.site_city,
			p.registrant_first_name,
			p.registrant_last_name,
			p.registrant_primary_phone,
			p.registrant_secondary_phone,
			p.registrant_fax_number,
			p.registrant_email_address,
			p.process_comments
		from mal_premises_detail p
		left join mal_region_lu r
		on p.site_region_name = r.region_name
		left join mal_regional_district_lu d
		on p.site_regional_district_name = d.district_name	
		where p.premises_job_id = ip_job_id 
		and p.import_status = 'PENDING' loop
			l_licence_id            := null;
			l_licence_number        := null;
			l_site_id               := null;
			l_apiary_site_id        := null;
			l_registrant_id         := null;
			l_process_comments      := null;
			l_error_message         := null;
			begin
	--  DO_NOT_IMPORT
				--
				if l_file_rec.import_action in ('DO_NOT_IMPORT') then
				-- Mark the Do Not Import rows.
					update mal_premises_detail
						set import_status    = 'NO_ACTION',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  'This row was marked as DO_NOT_IMPORT and was therefore not processed.')
						where id = l_file_rec.id;
	--  NEW_LICENCE (and Site, and Registrant)
				-- Process new licences and sites
				elsif l_file_rec.import_action in ('NEW_LICENCE' ) then
					-- Create a new Licence.
					insert into mal_licence(
						licence_type_id,
						status_code_id,
						region_id,
						regional_district_id,
						company_name,
						mail_address_line_1,
						mail_address_line_2,
						mail_city,
						mail_province,
						mail_postal_code,
						application_date,
						issue_date,
						expiry_date,
						total_hives,
						print_certificate
						)
						values(
							l_apiary_type_id,
							l_active_status_id,
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_file_rec.licence_company_name,
							l_file_rec.licence_mail_address_line_1,
							l_file_rec.licence_mail_address_line_2,
							l_file_rec.licence_mail_city,
							l_file_rec.licence_mail_province,
							l_file_rec.licence_mail_postal_code,
							current_date,  -- application_date,
							current_date,  -- issue_date,
							current_date + interval '2 years',  -- expiry_date,
							l_file_rec.licence_total_hives,
							true
							)
							returning id, licence_number into l_licence_id, l_licence_number;
					-- First apiary site ID for new licence.
					l_apiary_site_id = 100;
					--  Create a new Site.
					insert into mal_site (
						licence_id,
						apiary_site_id,
						region_id,
						regional_district_id,
						status_code_id,
						address_line_1,							
						premises_id,
						city,
						province
						)
						values (
							l_licence_id,
							l_apiary_site_id,   
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_active_status_id,
							l_file_rec.site_address_line_1,
							l_file_rec.source_premises_id,
							upper(l_file_rec.site_city),
							'BC')
						returning id into l_site_id;
					-- Create a new Registrant
					insert into mal_registrant(
						first_name,
						last_name,
						primary_phone,
						secondary_phone,
						fax_number,
						email_address)
						values(
							l_file_rec.registrant_first_name,
							l_file_rec.registrant_last_name,
							l_file_rec.registrant_primary_phone,
							l_file_rec.registrant_secondary_phone,
							l_file_rec.registrant_fax_number,
							l_file_rec.registrant_email_address
							)
							returning id into l_registrant_id;
					-- Add a reference to the new Registrant on the new Licence
					update mal_licence
						set primary_registrant_id = l_registrant_id
					where id = l_licence_id;
					-- Add a row to the cross reference table for the new licence and registrant.
					insert into mal_licence_registrant_xref(
						licence_id,
						registrant_id)
						values(
							l_licence_id,
							l_registrant_id
							);
					l_process_comments  = concat(l_file_rec.process_comments, 
												 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
												' This row was successfully processed. ');
					-- Update the imported row with the new Licence info.
					update mal_premises_detail
					set import_status            = 'SUCCESS',
						licence_id               = l_licence_id,
						licence_number           = l_licence_number,
						site_id                  = l_site_id,
						apiary_site_id           = l_apiary_site_id,
						registrant_id            = l_registrant_id,
						licence_action           = 'INSERT',
						licence_status           = 'SUCCESS',
						site_action              = 'INSERT',
						site_status              = 'SUCCESS',
						process_comments         = l_process_comments,
						licence_status_timestamp = current_timestamp,
						site_status_timestamp    = current_timestamp
					where id = l_file_rec.id;
					l_num_db_inserts = l_num_db_inserts + 1;
	--  NEW_SITE (existing Licence)
				-- New Site on exixsting Licence
				elsif l_file_rec.import_action in ('NEW_SITE') then
					--  Determine if the Licence exists
					select id
					into l_licence_id
					from mal_licence
					where licence_number = l_file_rec.licence_number;
					if l_licence_id is not null then
						-- Determine the next sequential apiary Site ID
						select coalesce(max(apiary_site_id) + 1, 100)
						into l_apiary_site_id
						from mal_site
						where licence_id = l_licence_id;
						--  Create a new Site.
						insert into mal_site (
							licence_id,
							apiary_site_id,
							region_id,
							regional_district_id,
							status_code_id,
							address_line_1,							
							premises_id,
							city,
							province
							)
							values (
								l_licence_id,
								l_apiary_site_id,
								l_file_rec.region_id,
								l_file_rec.regional_district_id,
								l_active_status_id,
								l_file_rec.site_address_line_1,
								l_file_rec.source_premises_id,
								upper(l_file_rec.site_city),
								'BC')
							returning id into l_site_id;
						-- Update the Licence expiry date.
						update mal_licence
							set expiry_date       = current_date + interval '2 years',
							    print_certificate = true
						where id = l_licence_id;
						l_process_comments  = concat(l_file_rec.process_comments, 
													 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
													' This row was successfully processed. ');
						-- Update the file row with the new IDs.
						update mal_premises_detail
						set import_status         = 'SUCCESS',
							licence_id            = l_licence_id,
							site_id               = l_site_id,
							apiary_site_id        = l_apiary_site_id,
							site_action           = 'INSERT',
							site_status           = 'SUCCESS',
							process_comments      = l_process_comments,
							site_status_timestamp = current_timestamp
						where id = l_file_rec.id;
						l_num_db_inserts = l_num_db_inserts + 1;
					else
						l_process_comments  = concat(l_file_rec.process_comments, 
													 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
													 ' The licence number ', l_licence_number, ' was not found in the Licence table. ');
						update mal_premises_detail
							set import_status    = 'NO_ACTION',
								process_comments = l_process_comments
							where id = l_file_rec.id;
						
					end if;
		--  UPDATE (Licence and Site)
				-- Process updates to licences and sites
				elsif l_file_rec.import_action in ('UPDATE') then
					select l.id, s.id
					into l_licence_id, l_site_id
					from mal_licence l
					left join mal_site s 
					on l.id = s.licence_id
					inner join mal_licence_type_lu t
					on l.licence_type_id = t.id
					inner join mal_status_code_lu st
					on s.status_code_id = st.id
					where t.licence_type = 'APIARY'
					and st.code_name = 'ACT'
					and l.licence_number = l_file_rec.licence_number
					and s.apiary_site_id = l_file_rec.apiary_site_id;
					if l_site_id is not null then
						update mal_licence
							set region_id            = l_file_rec.region_id,
								regional_district_id = l_file_rec.regional_district_id,
								company_name         = l_file_rec.licence_company_name,
								mail_address_line_1  = l_file_rec.licence_mail_address_line_1,
								mail_address_line_2  = l_file_rec.licence_mail_address_line_2,
								mail_city            = l_file_rec.licence_mail_city,
								mail_province        = l_file_rec.licence_mail_province,
								mail_postal_code     = l_file_rec.licence_mail_postal_code,	
								issue_date           = current_date,
								expiry_date          = current_date + interval '2 years',
							    total_hives          = l_file_rec.licence_total_hives,
							    print_certificate    = true
							where id = l_licence_id;
						update mal_site
							set region_id            = l_file_rec.region_id,
								regional_district_id = l_file_rec.regional_district_id,
								address_line_1       = l_file_rec.site_address_line_1,
								city                 = upper(l_file_rec.site_city),
								province             = 'BC',
								premises_id          = l_file_rec.source_premises_id
							where id = l_site_id;	
						update mal_premises_detail
							set licence_id       = l_licence_id,
								site_id          = l_site_id,
								import_status    = 'SUCCESS',
								process_comments = concat(process_comments, 
														  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
														  'The Licence and Site were successfully updated.')
							where id = l_file_rec.id;
					l_num_db_updates = l_num_db_updates + 1;
					else
						update mal_premises_detail
							set import_status    = 'NO_ACTION',
								process_comments = concat(process_comments, 
														  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
														  'No data was found for the Licence Number and/or Apiary Site ID provided.')
							where id = l_file_rec.id;
					end if;
				--
				else
				-- The import action is invalid
					update mal_premises_detail
						set import_status    = 'NO_ACTION',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  'The information supplied on this row is not a valid request.')
						where id = l_file_rec.id;			
				end if;				
			exception
				when others then
	                get stacked diagnostics l_error_message = MESSAGE_TEXT;
					l_process_comments  = concat(l_file_rec.process_comments, 
												 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
												' An error was made while processing this row. ');
					update mal_premises_detail
						set import_status    = 'ERROR',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  l_error_sqlstate, ' ',
													  l_error_message, ' ',
													  l_error_context)
						where id = l_file_rec.id;
					commit;
			end;
		end loop;
	--	
	-- Capture existing process comments, in case this is not the first time this row was processed.
	case 
		when l_num_file_inserts = l_num_db_inserts
		 and l_num_file_updates = l_num_db_updates
		then iop_job_status = 'SUCCESS';
			 iop_process_comments = 'The rows were successfully processed.';
		else iop_job_status = 'WARNING'; 
			 iop_process_comments = 'One or more of the rows was not successfully processed. Check the mal_premises_detail table.';
	end case;
	-- Update the Job table.
	update mal_premises_job 
		set
			job_status              = iop_job_status,
			target_insert_count     = l_num_db_inserts,
			target_update_count     = l_num_db_updates,
			execution_end_time      = current_timestamp,
			execution_comment       = iop_process_comments,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
	-- 
end; 
$procedure$
;
