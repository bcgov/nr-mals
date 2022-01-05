SET statement_timeout = 0; 
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;
	
	
--
-- DROP:  ALL VIEWS
--

DROP VIEW IF EXISTS mal_apiary_inspection_vw                     CASCADE;
DROP VIEW IF EXISTS mal_apiary_producer_vw                       CASCADE;
DROP VIEW IF EXISTS mal_dairy_farm_tank_vw                       CASCADE;
DROP VIEW IF EXISTS mal_dairy_farm_test_infraction_vw            CASCADE;
DROP VIEW IF EXISTS mal_licence_action_required_vw               CASCADE;
DROP VIEW IF EXISTS mal_licence_species_vw                       CASCADE;
DROP VIEW IF EXISTS mal_licence_summary_vw                       CASCADE;
DROP VIEW IF EXISTS mal_licence_type_species_vw                  CASCADE;
DROP VIEW IF EXISTS mal_print_card_vw                            CASCADE;
DROP VIEW IF EXISTS mal_print_certificate_vw                     CASCADE;
DROP VIEW IF EXISTS mal_print_dairy_farm_infraction_vw           CASCADE;
DROP VIEW IF EXISTS mal_print_dairy_farm_tank_recheck_vw         CASCADE;
DROP VIEW IF EXISTS mal_print_licence_species_vw                 CASCADE;
DROP VIEW IF EXISTS mal_print_renewal_vw                         CASCADE;
DROP VIEW IF EXISTS mal_site_detail_vw                           CASCADE;


--
-- VIEW:  MAL_APIARY_INSPECTION_VW
--

CREATE OR REPLACE VIEW mal_apiary_inspection_vw as
	select 			
		insp.id apiary_inspection_id,
		lic.id licence_id,
		lic.licence_number,
		stat.code_description licence_status,
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
		lic.hives_per_apiary,
		site.hive_count
	from mal_apiary_inspection insp
	inner join mal_site site
	on insp.site_id = site.id
	inner join mal_licence lic
	on site.licence_id = lic.id
	inner join mals_app.mal_status_code_lu stat 
	on lic.status_code_id = stat.id 
	inner join mal_registrant reg
	on lic.primary_registrant_id = reg.id
	inner join mal_region_lu rgn
	on site.region_id = rgn.id;

--
-- VIEW:  MAL_APIARY_PRODUCER_VW
--

CREATE OR REPLACE VIEW mal_apiary_producer_vw as 
	select site.id site_id,
		lic.id licence_id,
		lic.licence_number,
		stat.code_name site_status,
		site.apiary_site_id,
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
	inner join mals_app.mal_status_code_lu stat
	on site.status_code_id = stat.id
	where lictyp.licence_type = 'APIARY'
	and stat.code_name = 'ACT';

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
		dft.recheck_year
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
-- VIEW:  MAL_DAIRY_FARM_TEST_INFRACTION_VW
--

CREATE OR REPLACE VIEW mal_dairy_farm_test_infraction_vw as
	with thresholds as (
		select species_sub_code
		    ,upper_limit
		    ,infraction_window
		from mals_app.mal_dairy_farm_test_threshold_lu
		where species_code = 'FRMQA'
		and active_flag=true),
	result1 as (
		-- Calculate the dates and infraction flag for each Species Sub Code
		select rslt.id test_result_id
		    ,rslt.test_job_id 
		    ,rslt.irma_number 
		    --
		    --  SPC1
		    ,case 
		       when spc1_day is null or spc1_day = ''
		       then null
		       else cast(concat(test_year,'-',test_month,'-',spc1_day) as date)
		     end spc1_date
		    ,spc1_thr.infraction_window spc1_infraction_window
		    ,case 
		       when spc1_value > spc1_thr.upper_limit
		       then true
		       else false
		     end spc1_infraction_flag
		    --
		    --  SCC
		    ,case 
		       when scc_day is null or scc_day = ''
		       then null
		       else cast(concat(test_year,'-',test_month,'-',scc_day) as date)
		     end scc_date
		    ,scc_thr.infraction_window scc_infraction_window
		    ,case 
		       when scc_value > scc_thr.upper_limit
		       then true
		       else false
		     end scc_infraction_flag
		    --
		    --  CRY
		    ,case 
		       when cry_day is null or cry_day = ''
		       then null
		       else cast(concat(test_year,'-',test_month,'-',cry_day) as date)
		     end cry_date
		    ,cry_thr.infraction_window cry_infraction_window
		    ,case 
		       when cry_value > cry_thr.upper_limit
		       then true
		       else false
		     end cry_infraction_flag
		    --
		    --  FFA
		    ,case 
		       when ffa_day is null or ffa_day = ''
		       then null
		       else cast(concat(test_year,'-',test_month,'-',ffa_day) as date)
		     end ffa_date
		    ,ffa_thr.infraction_window ffa_infraction_window
		    ,case 
		       when ffa_value > ffa_thr.upper_limit
		       then true
		       else false
		     end ffa_infraction_flag
		    --
		    --  IH
		    ,case 
		       when ih_day is null or ih_day = ''
		       then null
		       else cast(concat(test_year,'-',test_month,'-',ih_day) as date)
		     end ih_date
		    ,ih_thr.infraction_window ih_infraction_window
		    ,case 
		       when ih_value > ih_thr.upper_limit
		       then true
		       else false
		     end ih_infraction_flag
		from mal_dairy_farm_test_result rslt
		left join thresholds spc1_thr
		on spc1_thr.species_sub_code = 'SPC1'
		left join thresholds scc_thr
		on scc_thr.species_sub_code = 'SCC'
		left join thresholds cry_thr
		on cry_thr.species_sub_code = 'CRY'
		left join thresholds ffa_thr
		on ffa_thr.species_sub_code = 'FFA'
		left join thresholds ih_thr
		on ih_thr.species_sub_code = 'IH'),
	result2 as (
		-- Calculate the first date of th infraction window for each Species Sub Code
		select test_result_id
		    ,test_job_id 	
		    ,irma_number 
			,spc1_date
			,(spc1_date - cast(spc1_infraction_window as interval) + interval '1 day')::date spc1_previous_infraction_first_date
			,spc1_infraction_flag
			,scc_date
			,(scc_date - cast(scc_infraction_window as interval) + interval '1 day')::date scc_previous_infraction_first_date
			,scc_infraction_flag
			,cry_date
			,(cry_date - cast(cry_infraction_window as interval) + interval '1 day')::date cry_previous_infraction_first_date
			,cry_infraction_flag
			,ffa_date
			,(ffa_date - cast(ffa_infraction_window as interval) + interval '1 day')::date ffa_previous_infraction_first_date
			,ffa_infraction_flag
			,ih_date
			,(ih_date - cast(ih_infraction_window as interval) + interval '1 day')::date ih_previous_infraction_first_date
			,ih_infraction_flag
		from result1),
	result3 as (
		-- Calculate the infraction count for each Species Sub Code;
		select result2.test_result_id
		    ,result2.test_job_id 
		    ,result2.irma_number 
			,lic.id licence_id
			,result2.spc1_date
			,result2.spc1_infraction_flag
			,result2.spc1_previous_infraction_first_date
			,(select count(*) 
		      from mal_dairy_farm_test_result sub 
		      where sub.irma_number=result2.irma_number
		      and sub.spc1_infraction_flag=true
		      and sub.spc1_date >= result2.spc1_previous_infraction_first_date
		      and sub.spc1_date <  result2.spc1_date) spc1_previous_infraction_count
			,result2.scc_date
			,result2.scc_infraction_flag
			,result2.scc_previous_infraction_first_date
			,(select count(*) 
		      from mal_dairy_farm_test_result sub 
		      where sub.irma_number=result2.irma_number
		      and sub.scc_infraction_flag=true
		      and sub.scc_date >= result2.scc_previous_infraction_first_date
		      and sub.scc_date <  result2.scc_date) scc_previous_infraction_count
			,result2.cry_date
			,result2.cry_infraction_flag
			,result2.cry_previous_infraction_first_date
			,(select count(*) 
		      from mal_dairy_farm_test_result sub 
		      where sub.irma_number=result2.irma_number
		      and sub.cry_infraction_flag=true
		      and sub.cry_date >= result2.cry_previous_infraction_first_date
		      and sub.cry_date <  result2.cry_date) cry_previous_infraction_count
			,result2.ffa_date
			,result2.ffa_infraction_flag
			,result2.ffa_previous_infraction_first_date
			,(select count(*) 
		      from mal_dairy_farm_test_result sub 
		      where sub.irma_number=result2.irma_number
		      and sub.ffa_infraction_flag=true
		      and sub.ffa_date >= result2.ffa_previous_infraction_first_date
		      and sub.ffa_date <  result2.ffa_date) ffa_previous_infraction_count
			,result2.ih_date
			,result2.ih_infraction_flag
			,result2.ih_previous_infraction_first_date
			,(select count(*) 
		      from mal_dairy_farm_test_result sub 
		      where sub.irma_number=result2.irma_number
		      and sub.ih_infraction_flag=true
		      and sub.ih_date >= result2.ih_previous_infraction_first_date
		      and sub.ih_date <  result2.ih_date) ih_previous_infraction_count
		from result2
	    left join mal_licence lic
	    on result2.irma_number = lic.irma_number),
	infractions as (
	    select subq.*
		    ,case
		         when subq.previous_infractions_count = max(subq.previous_infractions_count) 
		              over (partition by species_sub_code) 
		         then true 
		     end max_previous_infractions_flag
	    from (
			select thr.species_code
			    ,thr.species_sub_code 
			    ,thr.upper_limit 
			    ,thr.infraction_window
			    ,inf.previous_infractions_count
			    ,inf.levy_percentage 
			    ,inf.correspondence_code 
			    ,inf.correspondence_description 
			from mal_dairy_farm_test_threshold_lu thr 
			inner join mal_dairy_farm_test_infraction_lu inf 
			on thr.id = inf.test_threshold_id 
			and thr.active_flag = true 
			and inf.active_flag = true) subq)
	--
	--  MAIN QUERY
	--
	select result3.test_result_id
		,result3.test_job_id
		,result3.licence_id
		,result3.irma_number
		,result3.spc1_date
		,result3.spc1_infraction_flag
		,result3.spc1_previous_infraction_first_date
		,result3.spc1_previous_infraction_count
		,spc1_inf.levy_percentage spc1_levy_percentage
		,spc1_inf.correspondence_code spc1_correspondence_code
		,spc1_inf.correspondence_description spc1_correspondence_description
		,result3.scc_date
		,result3.scc_infraction_flag
		,result3.scc_previous_infraction_first_date
		,result3.scc_previous_infraction_count
		,scc_inf.levy_percentage scc_levy_percentage
		,scc_inf.correspondence_code scc_correspondence_code
		,scc_inf.correspondence_description scc_correspondence_description
		,result3.cry_date
		,result3.cry_infraction_flag
		,result3.cry_previous_infraction_first_date
		,result3.cry_previous_infraction_count
		,cry_inf.levy_percentage cry_levy_percentage
		,cry_inf.correspondence_code cry_correspondence_code
		,cry_inf.correspondence_description cry_correspondence_description
		,result3.ffa_date
		,result3.ffa_infraction_flag
		,result3.ffa_previous_infraction_first_date
		,result3.ffa_previous_infraction_count
		,ffa_inf.levy_percentage ffa_levy_percentage
		,ffa_inf.correspondence_code ffa_correspondence_code
		,ffa_inf.correspondence_description ffa_correspondence_description
		,result3.ih_date
		,result3.ih_infraction_flag
		,result3.ih_previous_infraction_first_date
		,result3.ih_previous_infraction_count
		,ih_inf.levy_percentage ih_levy_percentage
		,ih_inf.correspondence_code ih_correspondence_code
		,ih_inf.correspondence_description ih_correspondence_description
	from result3 
	left join infractions spc1_inf
	on result3.spc1_infraction_flag = true
	and spc1_inf.species_sub_code = 'SPC1'
	and (result3.spc1_previous_infraction_count = spc1_inf.previous_infractions_count 
	     or 
	     (result3.spc1_previous_infraction_count > spc1_inf.previous_infractions_count
	     and spc1_inf.max_previous_infractions_flag = true))
	left join infractions scc_inf
	on result3.scc_infraction_flag = true
	and scc_inf.species_sub_code = 'SCC'
	and (result3.scc_previous_infraction_count = scc_inf.previous_infractions_count 
	     or 
	     (result3.scc_previous_infraction_count > scc_inf.previous_infractions_count
	     and scc_inf.max_previous_infractions_flag = true))
	left join infractions cry_inf
	on result3.cry_infraction_flag = true
	and cry_inf.species_sub_code = 'CRY'
	and (result3.cry_previous_infraction_count = cry_inf.previous_infractions_count 
	     or 
	     (result3.cry_previous_infraction_count > cry_inf.previous_infractions_count
	     and cry_inf.max_previous_infractions_flag = true))
	left join infractions ffa_inf
	on result3.ffa_infraction_flag = true
	and ffa_inf.species_sub_code = 'FFA'
	and (result3.spc1_previous_infraction_count = ffa_inf.previous_infractions_count 
	     or 
	     (result3.spc1_previous_infraction_count > ffa_inf.previous_infractions_count
	     and ffa_inf.max_previous_infractions_flag = true))
	left join infractions ih_inf
	on result3.ih_infraction_flag = true
	and ih_inf.species_sub_code = 'IH'
	and (result3.spc1_previous_infraction_count = ih_inf.previous_infractions_count 
	     or 
	     (result3.spc1_previous_infraction_count > ih_inf.previous_infractions_count
	     and ih_inf.max_previous_infractions_flag = true));

--
-- VIEW:  MAL_LICENCE_ACTION_REQUIRED_VW
--

CREATE OR REPLACE VIEW mal_licence_action_required_vw as 
	select 
	    lic.id licence_id,
	    lic.licence_number,
		lic.licence_type_id,
	    lictyp.licence_type,
		rgn.region_name,
	    licstat.code_name licence_status,
	    lictyp.legislation licence_type_legislation,
	    lic.company_name,
		-- Either, or both, of the First and Last Names may be null in the legacy data.
		nullif(concat(reg.first_name, ' ', reg.last_name),' ') registrant_name,
		case when reg.first_name is not null 
		      and reg.last_name is not null then 
	          	concat(reg.last_name, ', ', reg.first_name)
             else 
                  coalesce(reg.last_name, reg.first_name)
        end registrant_last_first,	
		trim(concat(lic.address_line_1 , ' ', lic.address_line_2)) licence_address,
		lic.city licence_city,
		lic.province licence_province,
		lic.postal_code licence_postal_code,
		lic.primary_phone licence_primary_phone,
		lic.secondary_phone licence_secondary_phone,
		lic.fax_number licence_fax_number,
		reg.email_address
	from mal_licence lic
	inner join mal_licence_type_lu lictyp 
	on lic.licence_type_id = lictyp.id
	inner join mal_status_code_lu licstat
	on lic.status_code_id = licstat.id 
	inner join mal_registrant reg 
	on lic.primary_registrant_id = reg.id
	left join mal_region_lu rgn 
	on lic.region_id = rgn.id
	where lic.action_required = true;

--
-- VIEW:  MAL_LICENCE_SPECIES_VW
--

CREATE OR REPLACE VIEW mal_licence_species_vw as 
	with inventory_details as ( 
		select licence_id, 
			species_sub_code_id,
			recorded_date,
			recorded_value
		from mal_fur_farm_inventory
		union all
		select licence_id, 
			species_sub_code_id,
			recorded_date,
			recorded_value
		from mal_game_farm_inventory)
	--
	--  MAIN QUERY
	--
    select licence_id,
    	spec.id species_code_id,
    	spec.code_name species_code,
    	sum(case spec_sub.code_name
    	  	  when 'FEMALE' 
    	  	  then dtl.recorded_value
    	  	  else 0
    		end) female_count,
    	sum(case spec_sub.code_name
    	  	  when 'MALE' then dtl.recorded_value
    	  	  else 0
    		end) male_count,
    	sum(case spec_sub.code_name
    	  	  when 'CALVES' then dtl.recorded_value
    	  	  else 0
    		end) calves_count,
    	sum(case spec_sub.code_name
    	  	  when 'SLAUGHTERED' then dtl.recorded_value
    	  	  else 0
    		end) slaughtered_count
	from inventory_details dtl
	inner join mal_licence_species_sub_code_lu spec_sub 
	on dtl.species_sub_code_id = spec_sub.id
	inner join mal_licence_species_code_lu spec
	on spec_sub.species_code_id = spec.id
	group by licence_id,
    	spec.id,
    	spec.code_name;

--
-- VIEW:  MAL_LICENCE_SUMMARY_VW
--

CREATE OR REPLACE VIEW mal_licence_summary_vw as 
	select 
		 lic.id licence_id
		,lic.licence_type_id
		,lic.status_code_id
		,lic.primary_registrant_id
		,lic.region_id
		,lic.regional_district_id
		,lic.plant_code_id
		,lic.species_code_id
		,lic.licence_number
		,lic.irma_number
		,lictyp.licence_type
		,reg.last_name
		,reg.first_name
	    ,lic.company_name
	    ,lic.primary_phone
	    ,lic.secondary_phone
	    ,lic.fax_number
	    ,reg.email_address
		,stat.code_description licence_status
		,lic.application_date
		,lic.issue_date
		,lic.expiry_date
		,lic.reissue_date
		,lic.fee_collected
		,lic.bond_continuation_expiry_date
		,rgn.region_name 
		,dist.district_name
		,lic.address_line_1
		,lic.address_line_2
		,lic.city 
		,lic.province
		,lic.postal_code
		,lic.country
		,lic.mail_address_line_1
		,lic.mail_address_line_2
		,lic.mail_city 
		,lic.mail_province
		,lic.mail_postal_code
		,lic.mail_country
	    ,case when lic.mail_address_line_1 is null
	      then trim(concat(lic.address_line_1 , ' ', lic.address_line_2))
	      else trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2))
	    end derived_mailing_address
	    ,case when lic.mail_address_line_1 is null
	      then lic.city
	      else lic.mail_city
	    end derived_mailing_city
	    ,case when lic.mail_address_line_1 is null
	      then lic.province
	      else lic.mail_province
	    end derived_mailing_province
	    ,case when lic.mail_address_line_1 is null
	      then concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
	      else concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
	    end derived_mailing_postal_code 
		,sp.code_name licence_species_code
		,lic.action_required
		,lic.print_certificate 
		,lic.print_renewal
		,lic.print_dairy_infraction
	from mal_licence lic
	inner join mal_registrant reg
	on lic.primary_registrant_id = reg.id
	inner join mal_licence_type_lu lictyp 
	on lic.licence_type_id = lictyp.id
	inner join mals_app.mal_status_code_lu stat 
	on lic.status_code_id = stat.id 
	left join mals_app.mal_region_lu rgn 
	on lic.region_id = rgn.id 
	left join mals_app.mal_regional_district_lu dist
	on lic.regional_district_id = dist.id
	left join mal_licence_species_code_lu sp
	on lic.species_code_id = sp.id;
	
--
-- VIEW:  MAL_LICENCE_TYPE_SPECIES_VW
--

CREATE OR REPLACE VIEW mal_licence_type_species_vw as
	with inventory_details as ( 
		select licence_id, 
			species_sub_code_id,
			recorded_date,
			recorded_value
		from mal_fur_farm_inventory
		union all
		select licence_id, 
			species_sub_code_id,
			recorded_date,
			recorded_value
		from mal_game_farm_inventory),
	  inventory_summary as ( 
	    select licence_id,
	    	sum(case sp_sub.code_name
	    	  	  when 'FEMALE' 
	    	  	  then dtl.recorded_value
	    	  	  else 0
	    		end) female_count,
	    	sum(case sp_sub.code_name
	    	  	  when 'MALE' then dtl.recorded_value
	    	  	  else 0
	    		end) male_count,
	    	sum(case sp_sub.code_name
	    	  	  when 'CALVES' then dtl.recorded_value
	    	  	  else 0
	    		end) calves_count,
	    	sum(case sp_sub.code_name
	    	  	  when 'SLAUGHTERED' then dtl.recorded_value
	    	  	  else 0
	    		end) slaughtered_count
		from inventory_details dtl
		inner join mal_licence_species_sub_code_lu sp_sub 
		on dtl.species_sub_code_id = sp_sub.id
		group by licence_id),
	  licence_details as (   
		select lic.id licence_id,
		    lic.licence_number,
		    typ.id licence_type_id,
		    typ.licence_type,
		    lic.issue_date,
		    lic.expiry_date,
		    reg.last_name,
		    reg.first_name,
		    case when lic.mail_address_line_1 is null
		      then trim(concat(lic.address_line_1 , ' ', lic.address_line_2))
		      else trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2))
		    end derived_mailing_address,
		    case when lic.mail_address_line_1 is null
		      then lic.city
		      else lic.mail_city
		    end derived_mailing_city,
		    case when lic.mail_address_line_1 is null
		      then lic.province
		      else lic.mail_province
		    end derived_mailing_province,
		    case when lic.mail_address_line_1 is null
		      then concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
		      else concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
		    end derived_mailing_postal_code, 
		    reg.primary_phone,
		    reg.email_address,
		    lic.fee_collected,
		    lic.bond_continuation_expiry_date,
		    sp.code_name licence_species_name
		from mal_licence lic
		inner join mal_licence_type_lu typ 
		on lic.licence_type_id = typ.id
		left join mal_registrant reg 
		on lic.primary_registrant_id = reg.id
		left join mal_licence_species_code_lu sp
		on lic.species_code_id = sp.id)
	--
	--  MAIN QUERY
	--
	select licdtl.licence_id,
	    licdtl.licence_number,
	    licdtl.licence_type_id,
	    licdtl.licence_type,
	    licdtl.issue_date,
	    licdtl.expiry_date,
	    licdtl.last_name,
	    licdtl.first_name,
	    licdtl.derived_mailing_address,
	    licdtl.derived_mailing_city,
	    licdtl.derived_mailing_province,
	    licdtl.derived_mailing_postal_code, 
	    licdtl.primary_phone,
	    licdtl.email_address,
	    licdtl.fee_collected,
	    licdtl.bond_continuation_expiry_date,
	    licdtl.licence_species_name,
	    invsum.female_count,
	    invsum.male_count,
	    invsum.calves_count,
	    invsum.slaughtered_count
	 from licence_details licdtl
	 left join inventory_summary invsum
	 on licdtl.licence_id = invsum.licence_id;

--
-- VIEW:  MAL_PRINT_CARD_VW
--

CREATE OR REPLACE VIEW mal_print_card_vw as
	with licence_base as (
		select
		    lictyp.licence_type ,
		    lic.company_name,
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) derived_company_name,
			nullif(concat(reg.first_name, ' ', reg.last_name),' ') registrant_name,
			case when reg.first_name is not null 
			      and reg.last_name is not null then 
		          	concat(reg.last_name, ', ', reg.first_name)
	             else 
	                  coalesce(reg.last_name, reg.first_name)
	        end registrant_last_first,		
		    cast(lic.licence_number as varchar) licence_number,
		    lic.issue_date,
		    lic.expiry_date,
		    to_char(lic.expiry_date, 'FMMonth dd, yyyy') expiry_date_display
			from mal_licence lic
			inner join mal_licence_type_lu lictyp 
			on lic.licence_type_id = lictyp.id
		    inner join mal_status_code_lu licstat
		    on lic.status_code_id = licstat.id 
			inner join mal_registrant reg 
			on lic.primary_registrant_id = reg.id
			where lic.print_certificate = true
			and licstat.code_name = 'ACT')
	--
	--  MAIN QUERY
	--
	select
		licence_type,
		case licence_type
		    when 'BULK TANK MILK GRADER' then 
				json_agg(json_build_object('CardLabel',             'Bulk Tank Milk Grader''s Identification Card',
											'LicenceHolderCompany',  company_name,
											'LicenceHolderName',     registrant_name,
											'LicenceNumber',         licence_number,
											'ExpiryDate',            expiry_date_display)
											order by company_name, licence_number) 
		    when 'LIVESTOCK DEALER AGENT' then 
				json_agg(json_build_object('CardType',               'Livestock Dealer Agent''s Identification Card',
											'LicenceHolderName',     registrant_name,
											'LastFirstName',         registrant_last_first,
											'LicenceNumber',         licence_number,
											'StartDate',             to_char(
											                                 greatest(issue_date,date_trunc('year', expiry_date) - interval '9 month'), 
											                                 'FMMonth dd, yyyy'),
											'ExpiryDate',            expiry_date_display)
											order by registrant_name, licence_number) 
		    when 'LIVESTOCK DEALER' then 
				json_agg(json_build_object('CardType',             'Livestock Dealer''s Identification Card',
											'LicenceHolderCompany',  derived_company_name,
											'LicenceNumber',         licence_number,
											'StartDate',             to_char(
																			greatest(issue_date,date_trunc('year', expiry_date) - interval '9 month'), 
																			'FMMonth dd, yyyy'),
											'ExpiryDate',            expiry_date_display)
											order by derived_company_name, licence_number)  
		end card_json
	from licence_base 
	where licence_type in ('BULK TANK MILK GRADER', 'LIVESTOCK DEALER AGENT', 'LIVESTOCK DEALER')
	group by licence_type;

--
-- VIEW:  MAL_PRINT_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mal_print_certificate_vw as 
	with licence_base as (
	    select 
		    lic.id licence_id,
		    lic.licence_number,
		    prnt_lic.licence_number parent_licence_number,
		    lictyp.licence_type,
		    spec.code_name species_description,
		    lictyp.legislation licence_type_legislation,
		    licstat.code_name licence_status,
		    reg.first_name registrant_first_name,
		    reg.last_name registrant_last_name,
		    -- If the Company Name is null then use the First/Last Names
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
			-- Either, or both, of the First and Last Names may be null in the legacy data.
			nullif(concat(reg.first_name, ' ', reg.last_name),' ') registrant_name,
			case when reg.first_name is not null 
			      and reg.last_name is not null then 
	          concat(reg.last_name, ', ', reg.first_name)
	             else 
	                  coalesce(reg.last_name, reg.first_name)
	        end registrant_last_first,
	        reg.official_title,
		    -- Consider the Company Name Override flag to determine the Licence Holder name.
		    case 
			  when lic.company_name_override and lic.company_name is not null 
			  then lic.company_name
			  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
			end derived_licence_holder_name,
		    case 
			  when prnt_lic.company_name_override and prnt_lic.company_name is not null 
			  then prnt_lic.company_name
			  else nullif(trim(concat(prnt_reg.first_name, ' ', prnt_reg.last_name)),'')
			end derived_parent_licence_holder_name,
		    -- Select the mailing address if it exists, otherwise select the main address.
		    case when lic.mail_address_line_1 is null
		      then trim(concat(lic.address_line_1 , ' ', lic.address_line_2))
		      else trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2))
		    end derived_mailing_address,
		    case when lic.mail_address_line_1 is null
		      then lic.city
		      else lic.mail_city
		    end derived_mailing_city,
		    case when lic.mail_address_line_1 is null
		      then lic.province
		      else lic.mail_province
		    end derived_mailing_province,
		    case when lic.mail_address_line_1 is null
		      then concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
		      else concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
		    end derived_mailing_postal_code,
		    lic.issue_date,
		    to_char(lic.issue_date, 'FMMonth dd, yyyy') issue_date_display,
		    lic.reissue_date,
		    to_char(lic.reissue_date, 'FMMonth dd, yyyy') reissue_date_display,
		    lic.expiry_date,
		    to_char(lic.expiry_date, 'FMMonth dd, yyyy') expiry_date_display,
		    lic.bond_number,
			lic.bond_value,
			lic.bond_carrier_name,
			lic.irma_number,
			lic.total_hives,
			reg.primary_phone,
		    case when reg.primary_phone is null 
		    	then null
			    else concat('(', substr(reg.primary_phone, 1, 3),
							') ', substr(reg.primary_phone, 4, 3),
							'-', substr(reg.primary_phone, 7, 4)) 
			end registrant_primary_phone_display,
			reg.email_address,
		    lic.print_certificate
		from mal_licence lic
		inner join mal_licence_type_lu lictyp 
		on lic.licence_type_id = lictyp.id
	    inner join mal_status_code_lu licstat
	    on lic.status_code_id = licstat.id 
		inner join mal_registrant reg 
		on lic.primary_registrant_id = reg.id				
		left join mal_licence_parent_child_xref xref 
		on lic.id = xref.child_licence_id
		left join mal_licence prnt_lic 
		on xref.parent_licence_id = prnt_lic.id
		left join mal_registrant prnt_reg 
		on prnt_lic.primary_registrant_id = prnt_reg.id	
		left join mal_licence_species_code_lu spec 
		on lic.species_code_id = spec.id
		left join mal_licence_type_lu sp_lt
		on spec.licence_type_id = sp_lt.id	
		where lic.print_certificate = true
		),
	active_site as (
		select s.id site_id,
		    l.id licence_id,  
		    l_t.licence_type,
			apiary_site_id,
		    concat(l.licence_number, '-', s.apiary_site_id) registration_number,
		    trim(concat(s.address_line_1, ' ', s.address_line_2)) address_1_2,
		    trim(concat(s.address_line_1, ' ', s.address_line_2, ' ', s.city, ' ', s.province, ' ', s.postal_code)) full_address,
	        s.city,
		    to_char(s.registration_date, 'yyyy/mm/dd') registration_date,
		    s.legal_description,
		    s.site_details,
		    row_number() over (partition by s.licence_id order by s.create_timestamp) row_seq
		from mal_licence l
		inner join mal_site s
		on l.id=s.licence_id
		inner join mal_licence_type_lu l_t
		on l.licence_type_id = l_t.id 
		left join mal_status_code_lu stat
		on s.status_code_id = stat.id
		-- Print flag included to improve performance.
		where stat.code_name='ACT'
		and l.print_certificate = true
		),
	apiary_site as (
		-- All Active sites will be included in the repeating JSON group.
		select licence_id, 		
		     json_agg(json_build_object('RegistrationNum',  registration_number,
		                                'Address',          address_1_2,
		                                'City',             city,
		                                'RegDate',          registration_date)
		                                order by apiary_site_id) apiary_site_json
		from active_site
		where licence_type = 'APIARY'
		group by licence_id),
    	-- The 
		dairy_tank as (
		-- Dairy Farms have only one site.
		select ast.licence_id, 	
	         json_agg(json_build_object('DairyTankCompany',          t.company_name,
	                                    'DairyTankModel',            t.model_number,
	                                    'DairyTankSN',               t.serial_number,
	                                    'DairyTankCapacity',         t.tank_capacity,
	                                    'DairyTankCalibrationDate',  to_char(t.calibration_date, 'yyyy/mm/dd'))
                                        order by t.serial_number, t.calibration_date) tank_json
		from active_site ast 
		inner join mal_dairy_farm_tank t 
		on ast.site_id=t.site_id
        group by ast.licence_id)
	--
	--  MAIN QUERY
	--
	select      
		base.licence_type,
		base.licence_number,
		base.licence_status,
		--  Each licence type has its own Certificate JSON statement in an attempt to simplify 
		--  maintenance and to avoid producing elements which will be ignored in the Certificates.
		case base.licence_type
		    when 'APIARY' then
				 json_build_object('LicenceHolderCompany',    base.company_name,
			                       'LicenceHolderName',       base.registrant_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'BeeKeeperID',             base.licence_number,
			                       'Phone',                   base.registrant_primary_phone_display,
			                       'Email',                   base.email_address,
			                       'TotalColonies',           base.total_hives,
			                       'ApiarySites',             apiary.apiary_site_json)
		    when 'BULK TANK MILK GRADER' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display)
		    when 'DAIRY FARM' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderCompany',    base.company_name,
			                       'LicenceHolderName',       base.registrant_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ReIssueDate',             base.reissue_date_display,
			                       'SiteDetails',             site.full_address,
			                       'SiteInformation',         tank.tank_json,
			                       'IRMA_Num',                base.irma_number)
		    when 'FUR FARM' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'Species',                 base.species_description,
			                       'SiteDetails',             site.site_details)
		    when 'GAME FARM' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'Species',                 base.species_description,
			                       'LegalDescription',        site.legal_description)
		    when 'HIDE DEALER' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display)
		    when 'LIMITED MEDICATED FEED' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderCompany',    base.company_name,
			                       'LicenceHolderName',       base.registrant_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'SiteDetails',             site.site_details)
		    when 'LIVESTOCK DEALER' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'BondNumber',              base.bond_number,
			                       'BondValue',               base.bond_value,
			                       'BondCarrier',             base.bond_carrier_name,
			                       'Nominee',                 base.registrant_name)
		    when 'LIVESTOCK DEALER AGENT' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,			                       
			                       'AgentFor',                base.derived_parent_licence_holder_name)
		    when 'MEDICATED FEED' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderCompany',    base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'LicenceHolderName',       base.registrant_name,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display)
		    when 'PUBLIC SALE YARD OPERATOR' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'LivestockDealerLicence',  base.parent_licence_number,
			                       'BondNumber',              base.bond_number ,
			                       'BondValue',               base.bond_value ,
			                       'BondCarrier',             base.bond_carrier_name ,
			                       'SaleYard',                base.derived_parent_licence_holder_name)
		    when 'PURCHASE LIVE POULTRY' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'SiteDetails',             site.site_details,
			                       'BondNumber',              base.bond_number,
			                       'BondValue',               base.bond_value,
			                       'BondCarrier',             base.bond_carrier_name,
			                       'BusinessAddressLocation', case 
																  when base.derived_mailing_address = site.address_1_2
																  then null 
															  	  else site.address_1_2
															  end)
		    when 'SLAUGHTERHOUSE' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'BondNumber',              base.bond_number,
			                       'BondValue',               base.bond_value,
			                       'BondCarrier',             base.bond_carrier_name)
		    when 'VETERINARY DRUG' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderCompany',    base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display)
		    when 'DISPENSER' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'LicenceHolderTitle',      base.official_title,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display)
		    end certificate_json,
		    --
		    --  All envelopes have the same layout.
			json_build_object('RegistrantLastFirst',     base.registrant_last_first,
			                  'MailingAddress',          base.derived_mailing_address,
			                  'MailingCity',             base.derived_mailing_city,
			                  'MailingProv',             base.derived_mailing_province,
			                  'PostCode',                base.derived_mailing_postal_code) envelope_json
	from licence_base base 
	left join apiary_site apiary
	on base.licence_id = apiary.licence_id
	left join active_site site
	on base.licence_id=site.licence_id 
	and site.row_seq = 1
	left join dairy_tank tank
	on base.licence_id=tank.licence_id 	
	where 1=1
	and base.licence_status='ACT';

--
-- VIEW:  MAL_PRINT_DAIRY_FARM_INFRACTION_VW
--

CREATE OR REPLACE VIEW mal_print_dairy_farm_infraction_vw as
	with base as (   
		select rslt.id dairy_farm_test_result_id,
		    rslt.licence_id,
		    lic.licence_number,
		    lictyp.licence_type,
			to_char(current_date, 'fmMonth dd, yyyy') currentdate,
			rslt.irma_number,
		    -- If the Company Name is null then use the First/Last Names
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) licence_holder_company,
		    lic.print_dairy_infraction,
		    case when lic.mail_address_line_1 is null
		      then trim(concat(lic.address_line_1 , ' ', lic.address_line_2))
		      else trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2))
		    end derived_mailing_address,
		    case when lic.mail_address_line_1 is null
		      then lic.city
		      else lic.mail_city
		    end derived_mailing_city,
		    case when lic.mail_address_line_1 is null
		      then lic.province
		      else lic.mail_province
		    end derived_mailing_province,
		    case when lic.mail_address_line_1 is null
		      then concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
		      else concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
		    end derived_mailing_postal_code,    
			to_char(rslt.create_timestamp , 'fmMonth dd, yyyy') test_result_create_date,
			to_char((cast(test_year as varchar)||to_char(test_month, 'fm09')||'01')::date, 'fmMonth, yyyy') levy_month_year,
			site.site_details,
			to_char(lic.issue_date, 'fmMonth dd, yyyy') issue_date,
		    -- Test results
			rslt.spc1_date,
		    to_char(spc1_value, 'fm999999990') spc1_value,
			rslt.spc1_infraction_flag,
		    case 
		      when spc1_levy_percentage is not null
		      then concat(spc1_levy_percentage,'%') 
		    end spc1_levy_percentage,
			rslt.spc1_correspondence_code,
			rslt.spc1_correspondence_description,
			rslt.scc_date,
		    to_char(scc_value, 'fm999999990') scc_value,
			rslt.scc_infraction_flag,
		    case 
		      when scc_levy_percentage is not null
		      then concat(scc_levy_percentage,'%') 
		    end scc_levy_percentage,
			rslt.scc_correspondence_code,
			rslt.scc_correspondence_description,
			rslt.cry_date,
		    to_char(cry_value, 'fm990.0') cry_value,
			rslt.cry_infraction_flag,
		    case 
		      when cry_levy_percentage is not null
		      then concat(cry_levy_percentage,'%') 
		    end cry_levy_percentage,
			rslt.cry_correspondence_code,
			rslt.cry_correspondence_description,
			rslt.ffa_date,
		    to_char(ffa_value, 'fm990.0') ffa_value,
			rslt.ffa_infraction_flag,
		    case 
		      when ffa_levy_percentage is not null
		      then concat(ffa_levy_percentage,'%') 
		    end ffa_levy_percentage,
			rslt.ffa_correspondence_code,
			rslt.ffa_correspondence_description,
			rslt.ih_date,
		    to_char(ih_value, 'fm990.00') ih_value,
			rslt.ih_infraction_flag,
		    case 
		      when ih_levy_percentage is not null
		      then concat(ih_levy_percentage,'%') 
		    end ih_levy_percentage,
			rslt.ih_correspondence_code,
			rslt.ih_correspondence_description
		from mal_dairy_farm_test_result rslt
		left join mal_licence lic 
		on rslt.licence_id = lic.id 
		left join mal_licence_type_lu lictyp
		on lic.licence_type_id = lictyp.id
		left join mal_registrant reg 
		on lic.primary_registrant_id = reg.id
		left join mal_site site 
		on lic.id = site.licence_id)
	--
	--  MAIN QUERY
	--
	select dairy_farm_test_result_id,
	    licence_id,
	    licence_number,
	    licence_type,
	    print_dairy_infraction,
	    'SPC1' species_sub_code,
		spc1_date recorded_date,
	    spc1_correspondence_code correspondence_code,
	    spc1_correspondence_description correspondence_description,
	    case spc1_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            currentdate,      
			                       'IRMA_Num',               irma_number,
			                       'LicenceHolderCompany',   licence_holder_company,
			                       'MailingAddress',         derived_mailing_address,
			                       'MailingCity',            derived_mailing_city,
			                       'MailingProv',            derived_mailing_province,
			                       'PostCode',               derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  test_result_create_date,
			                       'LevyMonthYear',          levy_month_year,
			                       'SpeciesSubCode',         'SPC1',
			                       'DairyTestIBC',           spc1_value,
			                       'CorrespondenceCode',     spc1_correspondence_code,
			                       'LevyPercent',            spc1_levy_percentage,
			                       'SiteDetails',            site_details,
			                       'IssueDate',              issue_date)
		  else null
		end infraction_json
	from base
	where spc1_infraction_flag = true
	union all
	select dairy_farm_test_result_id,
	    licence_id,
	    licence_number,
	    licence_type,
	    print_dairy_infraction,
	    'SCC' species_sub_code,
		scc_date recorded_date,
	    scc_correspondence_code correspondence_code,
	    scc_correspondence_description correspondence_description,
	    case scc_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            currentdate,      
			                       'IRMA_Num',               irma_number,
			                       'LicenceHolderCompany',   licence_holder_company,
			                       'MailingAddress',         derived_mailing_address,
			                       'MailingCity',            derived_mailing_city,
			                       'MailingProv',            derived_mailing_province,
			                       'PostCode',               derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  test_result_create_date,
			                       'LevyMonthYear',          levy_month_year,
			                       'SpeciesSubCode',         'SCC',
			                       'DairyTestSCC',           scc_value,
			                       'CorrespondenceCode',     scc_correspondence_code,
			                       'LevyPercent',            scc_levy_percentage,
			                       'SiteDetails',            site_details,
			                       'IssueDate',              issue_date)
		  else null
		end infraction_json
	from base
	where scc_infraction_flag = true
	union all
	select dairy_farm_test_result_id,
	    licence_id,
	    licence_number,
	    licence_type,
	    print_dairy_infraction,
	    'CRY' species_sub_code,
		cry_date recorded_date,
	    cry_correspondence_code correspondence_code,
	    cry_correspondence_description correspondence_description,
	    case cry_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            currentdate,      
			                       'IRMA_Num',               irma_number,
			                       'LicenceHolderCompany',   licence_holder_company,
			                       'MailingAddress',         derived_mailing_address,
			                       'MailingCity',            derived_mailing_city,
			                       'MailingProv',            derived_mailing_province,
			                       'PostCode',               derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  test_result_create_date,
			                       'LevyMonthYear',          levy_month_year,
			                       'SpeciesSubCode',         'CRY',
			                       'DairyTestCryoPercent',   cry_value,
			                       'CorrespondenceCode',     cry_correspondence_code,
			                       'LevyPercent',            cry_levy_percentage,
			                       'SiteDetails',            site_details,
			                       'IssueDate',              issue_date)
		  else null
		end infraction_json
	from base
	where cry_infraction_flag = true
	union all
	select dairy_farm_test_result_id,
	    licence_id,
	    licence_number,
	    licence_type,
	    print_dairy_infraction,
	    'FFA' species_sub_code,
		ffa_date recorded_date,
	    ffa_correspondence_code correspondence_code,
	    ffa_correspondence_description correspondence_description,
	    case ffa_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            currentdate,      
			                       'IRMA_Num',               irma_number,
			                       'LicenceHolderCompany',   licence_holder_company,
			                       'MailingAddress',         derived_mailing_address,
			                       'MailingCity',            derived_mailing_city,
			                       'MailingProv',            derived_mailing_province,
			                       'PostCode',               derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  test_result_create_date,
			                       'LevyMonthYear',          levy_month_year,
			                       'SpeciesSubCode',         'FFA',
			                       'DairyTestFFA',           ffa_value,
			                       'CorrespondenceCode',     ffa_correspondence_code,
			                       'LevyPercent',            ffa_levy_percentage,
			                       'SiteDetails',            site_details,
			                       'IssueDate',              issue_date)
		  else null
		end infraction_json
	from base
	where ffa_infraction_flag = true
	union all
	select dairy_farm_test_result_id,
	    licence_id,
	    licence_number,
	    licence_type,
	    print_dairy_infraction,
	    'IH' species_sub_code,
		ih_date recorded_date,
	    ih_correspondence_code correspondence_code,
	    ih_correspondence_description correspondence_description,
	    case ih_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            currentdate,      
			                       'IRMA_Num',               irma_number,
			                       'LicenceHolderCompany',   licence_holder_company,
			                       'MailingAddress',         derived_mailing_address,
			                       'MailingCity',            derived_mailing_city,
			                       'MailingProv',            derived_mailing_province,
			                       'PostCode',               derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  test_result_create_date,
			                       'LevyMonthYear',          levy_month_year,
			                       'SpeciesSubCode',         'IH',
			                       'DairyTestIH',            ih_value,
			                       'CorrespondenceCode',     ih_correspondence_code,
			                       'LevyPercent',            ih_levy_percentage,
			                       'SiteDetails',            site_details,
			                       'IssueDate',              issue_date)
		  else null
		end infraction_json
	from base
	where ih_infraction_flag = true;

--
-- VIEW:  MAL_PRINT_DAIRY_FARM_TANK_RECHECK_VW
--

CREATE OR REPLACE VIEW mal_print_dairy_farm_tank_recheck_vw as
	with licence as (   
		select lictyp.licence_type,
		    lic.id licence_id,
		    lic.licence_number,
		    lic.irma_number,
		    reg.last_name,
		    rgn.region_name,
		    dist.district_name,
		    tank.id tank_id,
		    tank.issue_date,
			tank.recheck_year,
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
		    case when lic.mail_address_line_1 is null
		      then trim(concat(lic.address_line_1 , ' ', lic.address_line_2))
		      else trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2))
		    end derived_mailing_address,
		    case when lic.mail_address_line_1 is null
		      then lic.city
		      else lic.mail_city
		    end derived_mailing_city,
		    case when lic.mail_address_line_1 is null
		      then lic.province
		      else lic.mail_province
		    end derived_mailing_province,
		    case when lic.mail_address_line_1 is null
		      then concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
		      else concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
		    end derived_mailing_postal_code,
		    print_recheck_notice
		from mal_dairy_farm_tank tank 
		inner join mal_site site 
		on tank.site_id = site.id
		inner join mal_licence lic 
		on site.licence_id = lic.id
		inner join mal_registrant reg 
		on lic.primary_registrant_id = reg.id
		inner join mal_licence_type_lu lictyp 
		on lic.licence_type_id = lictyp.id
		left join mal_region_lu rgn
		on site.region_id = rgn.id
		left join mal_regional_district_lu dist
		on site.regional_district_id = dist.id)
	--
	--  MAIN QUERY
	--
	select licence_type,
		licence_id,			
		licence_number,	
		irma_number,
		last_name,
		region_name,
		district_name,
		tank_id,
		issue_date,
		recheck_year,
		print_recheck_notice,
		json_build_object('CurrentDate',           to_char(current_date, 'fmMonth dd, yyyy'),
						  'CurrentYear',           to_char(current_date, 'yyyy'),
						  'IRMA_Num',              irma_number,
						  'LicenceHolderCompany',  company_name,
	                      'MailingAddress',        derived_mailing_address,
	                      'MailingCity',           derived_mailing_city,
	                      'MailingProv',           derived_mailing_province,
	                      'PostCode',              derived_mailing_postal_code) recheck_notice_json
	from licence;

--
-- VIEW:  MAL_PRINT_RENEWAL_VW
--

 CREATE OR REPLACE VIEW mal_print_renewal_vw as 
	with licence_base as (
	    select 
		    lic.id licence_id,
		    cast(lic.licence_number as varchar) licence_number,
		    lictyp.id licence_type_id,
		    lictyp.licence_type,
		    spec.code_name species_code,
		    licstat.code_name licence_status,
		    reg.first_name registrant_first_name,
		    reg.last_name registrant_last_name,
		    -- If the Company Name is null then use the First/Last Names
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
			-- Either, or both, of the First and Last Names may be null in the legacy data.
			nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'') registrant_name,
			case when reg.first_name is not null 
			      and reg.last_name is not null then 
	          		concat(reg.last_name, ', ', reg.first_name)
	             else 
	                  coalesce(reg.last_name, reg.first_name)
	        end registrant_last_first,
		    -- Consider the Company Name Override flag to determine the Licence Holder name.
		    case 
			  when lic.company_name_override and lic.company_name is not null 
			  then lic.company_name
			  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
			end derived_licence_holder_name,
		    -- Select the mailing address if it exists, otherwise select the main address.
		    case when lic.mail_address_line_1 is null
		      then trim(concat(lic.address_line_1 , ' ', lic.address_line_2))
		      else trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2))
		    end derived_address,
		    case when lic.mail_address_line_1 is null
		      then lic.city
		      else lic.mail_city
		    end derived_city,
		    case when lic.mail_address_line_1 is null
		      then lic.province
		      else lic.mail_province
		    end derived_province,
		    case when lic.mail_address_line_1 is null
		      then concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
		      else concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
		    end derived_postal_code,
		    lic.expiry_date,
		    to_char(lic.expiry_date, 'FMMonth dd, yyyy') expiry_date_display,
		    lictyp.standard_issue_date,
		    to_char(lictyp.standard_issue_date, 'FMMonth dd, yyyy') standard_issue_date_display,
		    lictyp.standard_expiry_date,
		    to_char(lictyp.standard_expiry_date, 'FMMonth dd, yyyy') standard_expiry_date_display,
		    to_char(lictyp.standard_expiry_date, 'FMyyyy') standard_expiry_year_display,
		    to_char(lictyp.standard_fee,'FM990.00') licence_fee_display,
			lic.bond_carrier_name,
			lic.bond_number,
			to_char(lic.bond_value,'FM999,990.00') bond_value_display,
		    case when reg.primary_phone is null 
		    	then null
			    else concat('(', substr(reg.primary_phone, 1, 3),
							') ', substr(reg.primary_phone, 4, 3),
							'-', substr(reg.primary_phone, 7, 4)) 
			end registrant_primary_phone_display,
			reg.email_address,
			lic.total_hives
		from mal_licence lic
		inner join mal_licence_type_lu lictyp 
		on lic.licence_type_id = lictyp.id 
	    inner join mal_status_code_lu licstat
	    on lic.status_code_id = licstat.id 
		inner join mal_registrant reg 
		on lic.primary_registrant_id = reg.id				
		left join mal_licence_parent_child_xref xref 
		on lic.id = xref.child_licence_id
		left join mal_licence prnt_lic 
		on xref.parent_licence_id = prnt_lic.id
		left join mal_licence_species_code_lu spec 
		on lic.species_code_id = spec.id
		left join mal_licence_type_lu sp_lt
		on spec.licence_type_id = sp_lt.id	
		where lic.print_renewal = true
		),
	active_site as (
		select s.id site_id,
		    l.id licence_id,  
		    l_t.licence_type,
			apiary_site_id,
		    concat(l.licence_number, '-', s.apiary_site_id) registration_number,
		    trim(concat(s.address_line_1, ' ', s.address_line_2)) address,
	        s.city,
		    to_char(s.registration_date, 'yyyy/mm/dd') registration_date,
		    s.legal_description,
		    -- Produce the site address only if it differs from the licence address.
		    case when l.address_line_1 = s.address_line_1 
		    	then null 
		    	else s.address_line_1
		    end derived_site_mailing_address,
		    case when l.address_line_1 = s.address_line_1 
		    	then null 
		    	else s.city
		    end derived_site_mailing_city,
		    case when l.address_line_1 = s.address_line_1 
		    	then null 
		    	else s.province
		    end derived_site_mailing_province,
		    case when l.address_line_1 = s.address_line_1 
		    	then null 
		    	else concat(substr(s.postal_code, 1, 3), ' ', substr(s.postal_code, 4, 3))
		    end derived_site_postal_code,
		    row_number() over (partition by s.licence_id order by s.create_timestamp) row_seq
		from mal_licence l
		inner join mal_site s
		on l.id=s.licence_id
		inner join mal_licence_type_lu l_t
		on l.licence_type_id = l_t.id 
		left join mal_status_code_lu stat
		on s.status_code_id = stat.id
		-- Print flag included to improve performance.
		where l.print_renewal = true
		and stat.code_name='ACT'
		and l_t.licence_type in ('APIARY', 'FUR FARM', 'GAME FARM')),
	apiary_site as (
		-- All Active sites will be included in the repeating JSON group.
		select licence_id, 		
		     json_agg(json_build_object('RegistrationNum',  registration_number,
		                                'Address',          address,
		                                'City',             city,
		                                'RegDate',          registration_date)
		                                order by apiary_site_id) apiary_site_json
		from active_site
		where licence_type = 'APIARY'
		group by licence_id),
	dispenser as (
		select prnt_lic.id parent_licence_id,
		     json_agg(json_build_object('DispLicenceHolderName', nullif(trim(concat(reg.first_name, ' ', reg.last_name)),''))
		                                order by nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')) dispenser_json
		from mal_licence prnt_lic
		inner join mal_licence_parent_child_xref xref 
		on xref.parent_licence_id = prnt_lic.id
		inner join mal_licence disp
		on xref.child_licence_id = disp.id
		inner join mal_registrant reg 
		on disp.primary_registrant_id = reg.id
		inner join mal_licence_type_lu prnt_ltyp
		on prnt_lic.licence_type_id = prnt_ltyp.id
		inner join mal_licence_type_lu disp_ltyp
		on disp.licence_type_id = disp_ltyp.id
		where disp_ltyp.licence_type = 'DISPENSER'
		group by prnt_lic.id),
	licence_species as (
		select ltyp.id licence_type_id, 
		     json_agg(json_build_object('Species',  code_name)
		                                order by code_name) species_json
		from mal_licence_type_lu ltyp
		inner join  mal_licence_species_code_lu spec 
		on ltyp.id = spec.licence_type_id 
		where spec.active_flag = true
		group by ltyp.id)
	--
	--  MAIN QUERY
	--
	select
	     base.licence_id, 
		 base.licence_number,
		 base.licence_type,
		 base.licence_status,
		--  Each licence type has its own Renewal JSON statement in an attempt to simplify 
		--  maintenance and to avoid producing elements which will be ignored in the Renewals.
		case base.licence_type
		    when 'APIARY' then
				 json_build_object('LastFirstName',         base.registrant_last_first,
			                       'LicenceHolderCompany',  base.company_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'BeeKeeperID',           base.licence_number,
			                       'Phone',                 base.registrant_primary_phone_display,
			                       'Email',                 base.email_address,
			                       'ExpiryDate',            base.expiry_date_display,
			                       'TotalColonies',         base.total_hives,
			                       'ApiarySites',           apiary_site.apiary_site_json) 
		    when 'BULK TANK MILK GRADER' then
				 json_build_object('LicenceYear',           base.standard_expiry_year_display,
			                       'LicenceHolderCompany',  base.company_name,
			                       'LastFirstName',         base.registrant_last_first,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display)
		    when 'FUR FARM' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
			                       'LicenceHolderCompany',  base.derived_licence_holder_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'SiteMailingAddress',    site.derived_site_mailing_address,
			                       'SiteMailingCity',       site.derived_site_mailing_city,
			                       'SiteMailingProv',       site.derived_site_mailing_province,
			                       'SitePostCode',          site.derived_site_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,			                       
			                       'SpeciesInventory',      species.species_json)
		    when 'GAME FARM' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
			                       'LicenceHolderCompany',  base.derived_licence_holder_name,
			                       'ClientPhoneNumber',     base.registrant_primary_phone_display,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'SiteMailingAddress',    site.derived_site_mailing_address,
			                       'SiteMailingCity',       site.derived_site_mailing_city,
			                       'SiteMailingProv',       site.derived_site_mailing_province,
			                       'SitePostCode',          site.derived_site_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,	
			                       'SiteLegalDescription',  site.legal_description,			                       
			                       'SpeciesInventory',      base.species_code)
		    when 'HIDE DEALER' then
		    	--
		    	--  Need to add LicenceHolderCompanyOperatingAs
		    	--
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
			                       'LicenceHolderCompany',  base.derived_licence_holder_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display)
		    when 'LIMITED MEDICATED FEED' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
			                       'LicenceHolderCompany',  base.derived_licence_holder_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display)
		    when 'LIVESTOCK DEALER AGENT' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
				                   'LicenceHolderCompany',  base.company_name,
				                   'LastFirstName',         base.registrant_last_first,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display)
		    when 'LIVESTOCK DEALER' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
				                   'LicenceHolderCompany',  base.company_name,
			                       'LicenceHolderName',     base.registrant_name,
				                   'LastFirstName',         base.registrant_last_first,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,
			                       'BondCarrier',           base.bond_carrier_name,
			                       'BondNumber',            base.bond_number,
			                       'BondValue',             base.bond_value_display)
		    when 'MEDICATED FEED' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
			                       'LicenceHolderCompany',  base.derived_licence_holder_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,
			                       'Dispensers',            disp.dispenser_json)
           when 'PUBLIC SALE YARD OPERATOR' then 
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
				                   'LicenceHolderCompany',  base.company_name,
				                   'LastFirstName',         base.registrant_last_first,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,
			                       'BondNumber',            base.bond_number,
			                       'BondValue',             base.bond_value_display)
           when 'PURCHASE LIVE POULTRY' then  
				 json_build_object('LicenceHolderName',     base.registrant_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,
			                       'BondCarrier',           base.bond_carrier_name,
			                       'BondNumber',            base.bond_number,
			                       'BondValue',             base.bond_value_display)
           when 'SLAUGHTERHOUSE' then 
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
				                   'LicenceHolderName',     base.registrant_name,
			                       'LicenceHolderPhone',    base.registrant_primary_phone_display,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number)
           when 'VETERINARY DRUG' then 
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
			                       'LicenceHolderCompany',  base.derived_licence_holder_name,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display,
			                       'Dispensers',            disp.dispenser_json)
		    when 'DISPENSER' then
				 json_build_object('LicenceStart',          base.standard_issue_date_display,
			                       'LicenceExpiry',         base.standard_expiry_date_display,
				                   'LastFirstName',         base.registrant_last_first,
			                       'MailingAddress',        base.derived_address,
			                       'MailingCity',           base.derived_city,
			                       'MailingProv',           base.derived_province,
			                       'PostCode',              base.derived_postal_code,
			                       'PhoneNumber',           base.registrant_primary_phone_display,
			                       'LicenceName',           base.licence_type,
			                       'LicenceNumber',         base.licence_number,
			                       'LicenceFee',            base.licence_fee_display) 
            end renewal_json
	from licence_base base
	left join  apiary_site 
	on base.licence_type = 'APIARY'
	and base.licence_id = apiary_site.licence_id
	left join active_site site
	on base.licence_type in ('FUR FARM', 'GAME FARM')
	and base.licence_id = site.licence_id
	and site.row_seq = 1
	left join dispenser disp
	on base.licence_type in ('MEDICATED FEED', 'VETERINARY DRUG')
	and base.licence_id = disp.parent_licence_id
	left join licence_species species 
	on base.licence_type_id = species.licence_type_id;

--
-- VIEW:  MAL_SITE_DETAIL_VW
--

 CREATE OR REPLACE VIEW mal_site_detail_vw as 
	select 	    
	    site.id site_id_pk,	 
	    lic.id licence_id,
	    site.status_code_id site_status_id,
	    sitestat.code_name site_status,
	    lic.status_code_id licence_status_id,
	    licstat.code_name licence_status,	
	    lic.licence_type_id licence_type_id,
	    lictyp.licence_type,
	    lic.licence_number,
		lic.irma_number licence_irma_number,
	    site.apiary_site_id,
	    case lictyp.licence_type 
			when 'APIARY'
	    	then concat(lic.licence_number, '-', site.apiary_site_id)  
	    	else null
    	end apiary_site_id_display,
	    site.contact_name site_contact_name,
	    site.address_line_1 site_address_line_1,
	    reg.first_name registrant_first_name,
	    reg.last_name registrant_last_name,
		-- Either, or both, of the First and Last Names may be null in the legacy data.
		nullif(trim(concat(reg.first_name,' ',reg.last_name)),'') registrant_first_last,
		case when reg.first_name is not null 
		      and reg.last_name is not null then 
		          concat(reg.last_name, ', ', reg.first_name)
             else 
                  coalesce(reg.last_name, reg.first_name)
        end registrant_last_first,		
	    lic.company_name,
		reg.primary_phone registrant_primary_phone,
		reg.email_address registrant_email_address,
	    lic.city licence_city,
	    r.region_number licence_region_number,
	    r.region_name licence_region_name,
	    rd.district_number licence_regional_district_number,
	    rd.district_name licence_regional_district_name
	from mal_licence lic
    inner join mal_site site 
    on lic.id=site.licence_id
    inner join mal_status_code_lu sitestat
    on site.status_code_id = sitestat.id 
	inner join mal_licence_type_lu lictyp 
	on lic.licence_type_id = lictyp.id
    inner join mal_status_code_lu licstat
    on lic.status_code_id = licstat.id 
	inner join mal_registrant reg 
	on lic.primary_registrant_id = reg.id
    left join mal_region_lu r 
    on site.region_id=r.id 
    left join mal_regional_district_lu rd 
    on site.regional_district_id=rd.id;
	