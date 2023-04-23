SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;


--        MALS-1229 - "Ghost" licenses / sites
--          Update 5K sites to Inactive, where the status_code_id is currently null.

--
-- TABLE:  MAL_SITE
--

update mal_site
	set status_code_id = (
		select id 
		from mal_status_code_lu 
		where code_name = 'INA')
	where status_code_id is null;


--        MALS-1181 - Apiary Site Report - including inactive and expired licenses
--          Added criteria to include only active Licences and Sites.
--        MALS-1189 - Producer Analysis Report by Region not calculating correctly
--          Added Coalesce 0, for hive count.
--          Changed INNER joins to LEFT joins for Region and District lookups, and added Coalesce 'UNKNOWN'.
--        MALS-1128 - Entire Province Needs to be an option in reports
--          Added criteria for 'ALL', to return data for all Regions

	
--
-- VIEW:  MAL_APIARY_PRODUCER_VW
--
DROP VIEW IF EXISTS mal_apiary_producer_vw;

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
		site.region_id site_region_id,
		coalesce(rgn.region_name, 'UNKNOWN') site_region_name,
		site.regional_district_id site_regional_district_id,
		coalesce(dist.district_name, 'UNKNOWN') site_district_name,
		trim(concat(site.address_line_1 , ' ', site.address_line_2)) site_address,
		coalesce(site.city, 'UNKNOWN') site_city,
		site.primary_phone site_primary_phone,
		site.registration_date,
	    lic.total_hives licence_hive_count,
	    coalesce(site.hive_count, 0) site_hive_count
	from mals_app.mal_licence lic
	inner join mal_registrant reg
	on lic.primary_registrant_id = reg.id
	inner join mal_site site
	on lic.id = site.licence_id
	inner join mal_licence_type_lu lictyp
	on lic.licence_type_id = lictyp.id
	left join mal_region_lu rgn
	on site.region_id = rgn.id
	left join mal_regional_district_lu dist
	on site.regional_district_id = dist.id
	left join mals_app.mal_status_code_lu lic_stat
	on lic.status_code_id = lic_stat.id
	left join mals_app.mal_status_code_lu site_stat
	on site.status_code_id = site_stat.id
	where lictyp.licence_type = 'APIARY';

GRANT SELECT ON TABLE mals_app.mal_apiary_producer_vw TO mals_app_role;
	
 

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
	with registrant_district_summary as (
			select registrant_id,
				site_district_name,
				--count(*) num_sites,
				sum(site_hive_count) site_hive_count,
				count(case when site_hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			where licence_status = 'ACT'
			and site_status = 'ACT'
			group by registrant_id,
				site_district_name),
		district_json as (
			select 
				json_agg(json_build_object('DistrictName',       site_district_name,
										   'Producers1To9',      num_registrants_1to9,
										   'Producers10Plus',    num_registrants_10plus,
										   'Producers1To19',     num_registrants_1to19,
										   'Producers20Plus',    num_registrants_20plus,
										   'ProducersTotal',     num_registrants,
										   'Colonies1To9',       site_hive_count_1to9,
										   'Colonies10Plus',     site_hive_count_10plus,	
										   'Colonies1To19',      site_hive_count_1to19,
										   'Colonies20Plus',     site_hive_count_20plus,										   
										   'ColoniesTotal',      site_hive_count)
			                                order by site_district_name) json_doc
			from (
					select site_district_name,
						count(case when site_hive_count between 1 and  9 then 1 else null end) num_registrants_1to9,
						count(case when site_hive_count >= 10            then 1 else null end) num_registrants_10plus,
						count(case when site_hive_count between 1 and 19 then 1 else null end) num_registrants_1to19,
						count(case when site_hive_count >= 20            then 1 else null end) num_registrants_20plus,
						count(*) num_registrants,
						sum(case when site_hive_count between 1 and  9 then site_hive_count else 0 end) site_hive_count_1to9,
						sum(case when site_hive_count >= 10            then site_hive_count else 0 end) site_hive_count_10plus,
						sum(case when site_hive_count between 1 and 19 then site_hive_count else 0 end) site_hive_count_1to19,
						sum(case when site_hive_count >= 20            then site_hive_count else 0 end) site_hive_count_20plus,
						sum(site_hive_count) site_hive_count
					from registrant_district_summary
					group by site_district_name
				  ) district_summary
			),
		report_summary as (
			select 
				count(distinct case when site_hive_count = 0              then registrant_id else null end) total_producers_hives_0,
				count(distinct case when site_hive_count between 1 and  9 then registrant_id else null end) total_registrants_1To9,
				count(distinct case when site_hive_count >= 10            then registrant_id else null end) total_registrants_10Plus,
				count(distinct case when site_hive_count between 1 and 19 then registrant_id else null end) total_registrants_1To19,
				count(distinct case when site_hive_count >= 20            then registrant_id else null end) total_registrants_20Plus,
				count(*) total_registrants,
				sum(case when site_hive_count between 1 and  9 then site_hive_count else 0 end) total_hives_1To9,
				sum(case when site_hive_count >= 10            then site_hive_count else 0 end) total_hives_10Plus,
				sum(case when site_hive_count between 1 and 19 then site_hive_count else 0 end) total_hives_1To19,
				sum(case when site_hive_count >= 20            then site_hive_count else 0 end) total_hives_20Plus,
				sum(site_hive_count) total_hives
			from mals_app.mal_apiary_producer_vw
			where licence_status = 'ACT'
			and site_status = 'ACT'
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
		'APIARY',
		null,
		'APIARY_PRODUCER_DISTRICT',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'District',                  dj.json_doc,
						  'TotalProducers1To9',        rs.total_registrants_1To9,
						  'TotalProducers10Plus',      rs.total_registrants_10Plus,
						  'TotalProducers1To19',       rs.total_registrants_1To19,
						  'TotalProducers20Plus',      rs.total_registrants_20Plus,
						  'TotalNumProducers',         rs.total_registrants,
						  'TotalColonies1To9',         rs.total_hives_1To9,
						  'TotalColonies10Plus',       rs.total_hives_10Plus,
						  'TotalColonies1To19',        rs.total_hives_1To19,
						  'TotalColonies20Plus',       rs.total_hives_20Plus,
						  'TotalNumColonies',          rs.total_hives,
						  'ProducersWithNoColonies',   rs.total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from district_json dj
cross join report_summary rs; 
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
	with registrant_region_summary as (
			select registrant_id,
				site_region_name,
				--count(*) num_sites,
				sum(site_hive_count) site_hive_count,
				count(case when site_hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			where licence_status = 'ACT'
			and site_status = 'ACT'
			group by registrant_id,
				site_region_name),
		region_summary as (
			select site_region_name,
				count(case when site_hive_count between 1 and  9 then 1 else null end) num_registrants_1to9,
				count(case when site_hive_count >= 10            then 1 else null end) num_registrants_10plus,
				count(case when site_hive_count between 1 and 19 then 1 else null end) num_registrants_1to19,
				count(case when site_hive_count >= 20            then 1 else null end) num_registrants_20plus,
				count(*) num_registrants,
				sum(case when site_hive_count between 1 and  9 then site_hive_count else 0 end) site_hive_count_1to9,
				sum(case when site_hive_count >= 10            then site_hive_count else 0 end) site_hive_count_10plus,
				sum(case when site_hive_count between 1 and 19 then site_hive_count else 0 end) site_hive_count_1to19,
				sum(case when site_hive_count >= 20            then site_hive_count else 0 end) site_hive_count_20plus,
				sum(site_hive_count) site_hive_count,
				sum(num_producers_hives_0) num_producers_hives_0
			from registrant_region_summary
			group by site_region_name),
		region_json as (
			select 
				json_agg(json_build_object('RegionName',         site_region_name,
										   'Producers1To9',      num_registrants_1to9,
										   'Producers10Plus',    num_registrants_10plus,
										   'Producers1To19',     num_registrants_1to19,
										   'Producers20Plus',    num_registrants_20plus,
										   'ProducersTotal',     num_registrants,
										   'Colonies1To9',       site_hive_count_1to9,
										   'Colonies10Plus',     site_hive_count_10plus,	
										   'Colonies1To19',      site_hive_count_1to19,
										   'Colonies20Plus',     site_hive_count_20plus,										   
										   'ColoniesTotal',      site_hive_count)
			                                order by site_region_name) json_doc
			from region_summary),
		report_summary as (
			select 
				count(distinct case when site_hive_count = 0              then registrant_id else null end) total_producers_hives_0,
				count(distinct case when site_hive_count between 1 and  9 then registrant_id else null end) total_registrants_1To9,
				count(distinct case when site_hive_count >= 10            then registrant_id else null end) total_registrants_10Plus,
				count(distinct case when site_hive_count between 1 and 19 then registrant_id else null end) total_registrants_1To19,
				count(distinct case when site_hive_count >= 20            then registrant_id else null end) total_registrants_20Plus,
				count(*) total_registrants,
				sum(case when site_hive_count between 1 and  9 then site_hive_count else 0 end) total_hives_1To9,
				sum(case when site_hive_count >= 10            then site_hive_count else 0 end) total_hives_10Plus,
				sum(case when site_hive_count between 1 and 19 then site_hive_count else 0 end) total_hives_1To19,
				sum(case when site_hive_count >= 20            then site_hive_count else 0 end) total_hives_20Plus,
				sum(site_hive_count) total_hives
			from mals_app.mal_apiary_producer_vw
			where licence_status = 'ACT'
			and site_status = 'ACT'
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
		'APIARY',
		null,
		'APIARY_PRODUCER_REGION',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Region',                    dj.json_doc,
						  'TotalProducers1To9',        rs.total_registrants_1To9,
						  'TotalProducers10Plus',      rs.total_registrants_10Plus,
						  'TotalProducers1To19',       rs.total_registrants_1To19,
						  'TotalProducers20Plus',      rs.total_registrants_20Plus,
						  'TotalNumProducers',         rs.total_registrants,
						  'TotalColonies1To9',         rs.total_hives_1To9,
						  'TotalColonies10Plus',       rs.total_hives_10Plus,
						  'TotalColonies1To19',        rs.total_hives_1To19,
						  'TotalColonies20Plus',       rs.total_hives_20Plus,
						  'TotalNumColonies',          rs.total_hives,
						  'ProducersWithNoColonies',   rs.total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from region_json dj
cross join report_summary rs;
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
			lic.licence_number::character varying AS licence_number,
			lic.issue_date,
			lic.expiry_date,
			to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display
		FROM mals_app.mal_licence lic
		JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
		JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
		JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
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
					'AgentFor', licence_base.company_name, 
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
						registration_date,
						address_line_1,							
						premises_id
						)
						values (
							l_licence_id,
							l_apiary_site_id,   
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_active_status_id,
							current_date,  -- registration_date,
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
							registration_date,
							address_line_1,							
							premises_id
							)
							values (
								l_licence_id,
								l_apiary_site_id,
								l_file_rec.region_id,
								l_file_rec.regional_district_id,
								l_active_status_id,
								current_date,  -- registration_date,
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
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'AgentFor', base.company_name)
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


--
--  2023-03-26  Merged in the following code in from release_5_3_ddl.sql
--


--        MALS-1211  Doc Gen Template - Dairy Infraction - SPC1-W edits required
--          Added ReportedOnDate to the JSON output
--        MALS-1212  Doc Gen Template - Dairy Infraction - SCC-W edits required
--          Added ReportedOnDate to the JSON output
--        MALS-1213  Doc Gen Template - Dairy Infraction - SPC1- L edits required
--          Added ReportedOnDate to the JSON output
--        MALS-1218  Doc Gen Template - Dairy Infraction - SPC1-S edits required
--          Added SiteAddress to the JSON output
--        MALS-1219  Doc Gen Template - Dairy Infraction - CRY-W - Re-write requested
--          Added CryMonthYear to the JSON output for CRY Warnings
--
-- VIEW:  MAL_PRINT_DAIRY_FARM_INFRACTION_VW
--

CREATE OR REPLACE VIEW mals_app.mal_print_dairy_farm_infraction_vw
AS WITH base AS (
         SELECT rslt.id AS dairy_farm_test_result_id,
            rslt.licence_id,
            lic.licence_number,
            lictyp.licence_type,
            to_char(CURRENT_DATE::timestamp with time zone, 'fmMonth dd, yyyy'::text) AS currentdate,
            rslt.irma_number,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS licence_holder_company,
            lic.print_dairy_infraction,
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
            to_char(greatest (spc1_date, scc_date, cry_date, ffa_date, ih_date), 'fmMonth dd, yyyy'::text) AS reported_on_date,
            to_char(rslt.create_timestamp, 'fmMonth dd, yyyy'::text) AS test_result_create_date,
            to_char((((rslt.test_year::character varying::text || to_char(rslt.test_month, 'fm09'::text)) || '01'::text)::date)::timestamp with time zone, 'fmMonth, yyyy'::text) AS levy_month_year,
            btrim(concat(site.address_line_1, ' ', site.address_line_2, ', ', site.city, ', ', site.province, ' ', 
            	substr(site.postal_code::text, 1, 3), ' ', substr(site.postal_code::text, 4, 3))) site_address,
            site.site_details,
            to_char(lic.issue_date::timestamp with time zone, 'fmMonth dd, yyyy'::text) AS issue_date,
            rslt.spc1_date,
            to_char(rslt.spc1_value, 'fm999999990'::text) AS spc1_value,
            rslt.spc1_infraction_flag,
                CASE
                    WHEN rslt.spc1_levy_percentage IS NOT NULL THEN concat(rslt.spc1_levy_percentage, '%')
                    ELSE NULL::text
                END AS spc1_levy_percentage,
            rslt.spc1_correspondence_code,
            rslt.spc1_correspondence_description,
            rslt.scc_date,
            to_char(rslt.scc_value, 'fm999999990'::text) AS scc_value,
            rslt.scc_infraction_flag,
                CASE
                    WHEN rslt.scc_levy_percentage IS NOT NULL THEN concat(rslt.scc_levy_percentage, '%')
                    ELSE NULL::text
                END AS scc_levy_percentage,
            rslt.scc_correspondence_code,
            rslt.scc_correspondence_description,
            rslt.cry_date,
            to_char(rslt.cry_date, 'fmMonth, yyyy') cry_month_year,
            to_char(rslt.cry_value, 'fm990.0'::text) AS cry_value,
            rslt.cry_infraction_flag,
                CASE
                    WHEN rslt.cry_levy_percentage IS NOT NULL THEN concat(rslt.cry_levy_percentage, '%')
                    ELSE NULL::text
                END AS cry_levy_percentage,
            rslt.cry_correspondence_code,
            rslt.cry_correspondence_description,
            rslt.ffa_date,
            to_char(rslt.ffa_value, 'fm990.0'::text) AS ffa_value,
            rslt.ffa_infraction_flag,
                CASE
                    WHEN rslt.ffa_levy_percentage IS NOT NULL THEN concat(rslt.ffa_levy_percentage, '%')
                    ELSE NULL::text
                END AS ffa_levy_percentage,
            rslt.ffa_correspondence_code,
            rslt.ffa_correspondence_description,
            rslt.ih_date,
            to_char(rslt.ih_value, 'fm990.00'::text) AS ih_value,
            rslt.ih_infraction_flag,
                CASE
                    WHEN rslt.ih_levy_percentage IS NOT NULL THEN concat(rslt.ih_levy_percentage, '%')
                    ELSE NULL::text
                END AS ih_levy_percentage,
            rslt.ih_correspondence_code,
            rslt.ih_correspondence_description
           FROM mal_dairy_farm_test_result rslt
             LEFT JOIN mal_licence lic ON rslt.licence_id = lic.id
             LEFT JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             LEFT JOIN mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mal_site site ON lic.id = site.licence_id
        )
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'SPC1'::text AS species_sub_code,
    base.spc1_date AS recorded_date,
    base.spc1_correspondence_code AS correspondence_code,
    base.spc1_correspondence_description AS correspondence_description,
        CASE base.spc1_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SPC1', 'DairyTestIBC', base.spc1_value, 'CorrespondenceCode', base.spc1_correspondence_code, 'LevyPercent', base.spc1_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.spc1_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'SCC'::text AS species_sub_code,
    base.scc_date AS recorded_date,
    base.scc_correspondence_code AS correspondence_code,
    base.scc_correspondence_description AS correspondence_description,
        CASE base.scc_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SCC', 'DairyTestSCC', base.scc_value, 'CorrespondenceCode', base.scc_correspondence_code, 'LevyPercent', base.scc_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.scc_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'CRY'::text AS species_sub_code,
    base.cry_date AS recorded_date,
    base.cry_correspondence_code AS correspondence_code,
    base.cry_correspondence_description AS correspondence_description,
        CASE base.cry_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'CRY', 'DairyTestCryoPercent', base.cry_value, 'CorrespondenceCode', base.cry_correspondence_code, 'LevyPercent', base.cry_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date, 'CryMonthYear', base.cry_month_year)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.cry_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'FFA'::text AS species_sub_code,
    base.ffa_date AS recorded_date,
    base.ffa_correspondence_code AS correspondence_code,
    base.ffa_correspondence_description AS correspondence_description,
        CASE base.ffa_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'FFA', 'DairyTestFFA', base.ffa_value, 'CorrespondenceCode', base.ffa_correspondence_code, 'LevyPercent', base.ffa_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.ffa_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'IH'::text AS species_sub_code,
    base.ih_date AS recorded_date,
    base.ih_correspondence_code AS correspondence_code,
    base.ih_correspondence_description AS correspondence_description,
        CASE base.ih_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'IH', 'DairyTestIH', base.ih_value, 'CorrespondenceCode', base.ih_correspondence_code, 'LevyPercent', base.ih_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.ih_infraction_flag = true;
 
 
--        MALS-1211  Apiary Inspection - Live Colonies in Yard number disappears after "create"
--          Added column  to view 
--
-- TABLE:  MAL_APIARY_INSPECTION
-- VIEW:   MAL_APIARY_INSPECTION_VW
--
 
 alter table mals_app.mal_apiary_inspection add live_colonies_in_yard integer;

drop view mals_app.mal_apiary_inspection_vw;

CREATE VIEW mals_app.mal_apiary_inspection_vw
AS SELECT insp.id AS apiary_inspection_id,
    lic.id AS licence_id,
    lic.licence_number,
    stat.code_description AS licence_status,
    site.apiary_site_id,
    rgn.region_name,
    reg.last_name,
    reg.first_name,
    insp.inspection_date,
    insp.colonies_tested,
    insp.brood_tested,
    insp.american_foulbrood_result,
    insp.european_foulbrood_result,
    insp.nosema_result,
    insp.chalkbrood_result,
    insp.sacbrood_result,
    insp.varroa_tested,
    insp.varroa_mite_result,
    insp.varroa_mite_result_percent,
    insp.small_hive_beetle_tested,
    insp.small_hive_beetle_result,
    insp.supers_inspected,
    insp.supers_destroyed,
    insp.live_colonies_in_yard,
    lic.hives_per_apiary,
    site.hive_count
   FROM mal_apiary_inspection insp
     JOIN mal_site site ON insp.site_id = site.id
     JOIN mal_licence lic ON site.licence_id = lic.id
     JOIN mal_status_code_lu stat ON lic.status_code_id = stat.id
     JOIN mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mal_region_lu rgn ON site.region_id = rgn.id;
 
 
--        MALS-1127  Renewal Notice for Purchase Live Poultry Incorrect
--          Sourced LicenceHolderName element from the Company Name column for PURCHASE LIVE POULTRY licence renewals.
--        MALS-1128  Renewal Notice for Purchase Live Poultry Incorrect dates
--          Added LicenceTypeFiscalYear to the JSON output for PURCHASE LIVE POULTRY licences.
--
-- VIEW:   MAL_PRINT_RENEWAL_VW
--
 
CREATE OR REPLACE VIEW mals_app.mal_print_renewal_vw
AS WITH licence_base AS (
         SELECT lic.id AS licence_id,
            lic.licence_number::character varying AS licence_number,
            lictyp.id AS licence_type_id,
            lictyp.licence_type,
            spec.code_name AS species_code,
            licstat.code_name AS licence_status,
            reg.first_name AS registrant_first_name,
            reg.last_name AS registrant_last_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS company_name,
            NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
                CASE
                    WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name::text
                    ELSE NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)
                END AS derived_licence_holder_name,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_postal_code,
            lic.expiry_date,
            to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display,
            lictyp.standard_issue_date,
            to_char(lictyp.standard_issue_date, 'FMMonth dd, yyyy'::text) AS standard_issue_date_display,
            lictyp.standard_expiry_date,
            to_char(lictyp.standard_expiry_date, 'FMMonth dd, yyyy'::text) AS standard_expiry_date_display,
            to_char(lictyp.standard_expiry_date, 'FMyyyy'::text) AS standard_expiry_year_display,
            to_char(lictyp.standard_fee, 'FM990.00'::text) AS licence_fee_display,
            lic.bond_carrier_name,
            lic.bond_number,
            to_char(lic.bond_value, 'FM999,990.00'::text) AS bond_value_display,
                CASE
                    WHEN reg.primary_phone IS NULL THEN NULL::text
                    ELSE concat('(', substr(reg.primary_phone::text, 1, 3), ') ', substr(reg.primary_phone::text, 4, 3), '-', substr(reg.primary_phone::text, 7, 4))
                END AS registrant_primary_phone_display,
            reg.email_address,
            lic.total_hives,
            concat(to_char(lictyp.standard_issue_date, 'yyyy') , ' - ', to_char(lictyp.standard_expiry_date, 'yyyy')) licence_type_fiscal_year
           FROM mal_licence lic
             JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
             LEFT JOIN mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
             LEFT JOIN mal_licence_species_code_lu spec ON lic.species_code_id = spec.id
             LEFT JOIN mal_licence_type_lu sp_lt ON spec.licence_type_id = sp_lt.id
          WHERE lic.print_renewal = true
        ), active_site AS (
         SELECT s.id AS site_id,
            l.id AS licence_id,
            l_t.licence_type,
            s.apiary_site_id,
            concat(l.licence_number, '-', s.apiary_site_id) AS registration_number,
            btrim(concat(s.address_line_1, ' ', s.address_line_2)) AS address,
            s.city,
            to_char(s.registration_date, 'yyyy/mm/dd'::text) AS registration_date,
            s.legal_description,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::character varying
                    ELSE s.address_line_1
                END AS derived_site_mailing_address,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::character varying
                    ELSE s.city
                END AS derived_site_mailing_city,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::character varying
                    ELSE s.province
                END AS derived_site_mailing_province,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::text
                    ELSE concat(substr(s.postal_code::text, 1, 3), ' ', substr(s.postal_code::text, 4, 3))
                END AS derived_site_postal_code,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mal_licence l
             JOIN mal_site s ON l.id = s.licence_id
             JOIN mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE l.print_renewal = true AND stat.code_name::text = 'ACT'::text AND (l_t.licence_type::text = ANY (ARRAY['APIARY'::character varying::text, 'FUR FARM'::character varying::text, 'GAME FARM'::character varying::text]))
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address, 'City', active_site.city, 'RegDate', active_site.registration_date) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dispenser AS (
         SELECT prnt_lic.id AS parent_licence_id,
            json_agg(json_build_object('DispLicenceHolderName', NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)) ORDER BY (NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text))) AS dispenser_json
           FROM mal_licence prnt_lic
             JOIN mal_licence_parent_child_xref xref ON xref.parent_licence_id = prnt_lic.id
             JOIN mal_licence disp_1 ON xref.child_licence_id = disp_1.id
             JOIN mal_registrant reg ON disp_1.primary_registrant_id = reg.id
             JOIN mal_licence_type_lu prnt_ltyp ON prnt_lic.licence_type_id = prnt_ltyp.id
             JOIN mal_licence_type_lu disp_ltyp ON disp_1.licence_type_id = disp_ltyp.id
          WHERE disp_ltyp.licence_type::text = 'DISPENSER'::text
          GROUP BY prnt_lic.id
        ), licence_species AS (
         SELECT ltyp.id AS licence_type_id,
            json_agg(json_build_object('Species', spec.code_name) ORDER BY spec.code_name) AS species_json
           FROM mal_licence_type_lu ltyp
             JOIN mal_licence_species_code_lu spec ON ltyp.id = spec.licence_type_id
          WHERE spec.active_flag = true
          GROUP BY ltyp.id
        )
 SELECT base.licence_id,
    base.licence_number,
    base.licence_type,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LastFirstName', base.registrant_last_first, 'LicenceHolderCompany', base.company_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'ExpiryDate', base.expiry_date_display, 'TotalColonies', base.total_hives, 'ApiarySites', apiary_site.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('LicenceYear', base.standard_expiry_year_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'FUR FARM'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'SiteMailingAddress', site.derived_site_mailing_address, 'SiteMailingCity', site.derived_site_mailing_city, 'SiteMailingProv', site.derived_site_mailing_province, 'SitePostCode', site.derived_site_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'SpeciesInventory', species.species_json)
            WHEN 'GAME FARM'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'ClientPhoneNumber', base.registrant_primary_phone_display, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'SiteMailingAddress', site.derived_site_mailing_address, 'SiteMailingCity', site.derived_site_mailing_city, 'SiteMailingProv', site.derived_site_mailing_province, 'SitePostCode', site.derived_site_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'SiteLegalDescription', site.legal_description, 'SpeciesInventory', base.species_code)
            WHEN 'HIDE DEALER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIMITED MEDICATED FEED'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondCarrier', base.bond_carrier_name, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'MEDICATED FEED'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'Dispensers', disp.dispenser_json)
            WHEN 'PUBLIC SALE YARD OPERATOR'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'PURCHASE LIVE POULTRY'::text THEN json_build_object('LicenceHolderName', base.company_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondCarrier', base.bond_carrier_name, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display, 'LicenceTypeFiscalYear', base.licence_type_fiscal_year)
            WHEN 'SLAUGHTERHOUSE'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderName', base.registrant_name, 'LicenceHolderPhone', base.registrant_primary_phone_display, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number)
            WHEN 'VETERINARY DRUG'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'Dispensers', disp.dispenser_json)
            WHEN 'DISPENSER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'PhoneNumber', base.registrant_primary_phone_display, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            ELSE NULL::json
        END AS renewal_json
   FROM licence_base base
     LEFT JOIN apiary_site ON base.licence_type::text = 'APIARY'::text AND base.licence_id = apiary_site.licence_id
     LEFT JOIN active_site site ON (base.licence_type::text = ANY (ARRAY['FUR FARM'::character varying::text, 'GAME FARM'::character varying::text])) AND base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dispenser disp ON (base.licence_type::text = ANY (ARRAY['MEDICATED FEED'::character varying::text, 'VETERINARY DRUG'::character varying::text])) AND base.licence_id = disp.parent_licence_id
     LEFT JOIN licence_species species ON base.licence_type_id = species.licence_type_id;
    
    
    
 
 
  