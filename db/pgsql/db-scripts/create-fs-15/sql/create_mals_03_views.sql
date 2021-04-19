SET statement_timeout = 0; 
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;
	
	
--
-- DROP:  ALL VIEWS
--

DROP VIEW IF EXISTS mal_dairy_farm_test_infraction_vw            CASCADE;
DROP VIEW IF EXISTS mal_licence_summary_vw                       CASCADE;
DROP VIEW IF EXISTS mal_print_card_vw                            CASCADE;
DROP VIEW IF EXISTS mal_print_certificate_vw                     CASCADE;
DROP VIEW IF EXISTS mal_print_dairy_farm_notification_vw         CASCADE;
DROP VIEW IF EXISTS mal_print_renewal_vw                         CASCADE;
DROP VIEW IF EXISTS mal_site_detail_vw                           CASCADE;

--
-- VIEW:  MAL_DAIRY_FARM_TEST_INFRACTION_VW
--

create or replace view mal_dairy_farm_test_infraction_vw as
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
-- VIEW:  MAL_LICENCE_SUMMARY_VW
--

CREATE OR REPLACE VIEW mal_licence_summary_vw as 
	with registrants as (
	  select 
	       x.licence_id 
	      ,string_agg(distinct r.last_name, '~' order by r.last_name) last_name
	      ,string_agg(distinct r.email_address, '~' order by r.email_address) email_address
	  from mal_registrant r
	  inner join mal_licence_registrant_xref x 
	  on r.id=x.registrant_id
	  group by x.licence_id)
	--
	--  MAIN QUERY
	--
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
	    ,lic.company_name
	    ,reg.email_address
		,stat.code_description licence_status
		,lic.application_date
		,lic.issue_date
		,lic.expiry_date
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
		,lic.print_certificate 
	from mal_licence lic
	inner join mal_licence_type_lu lictyp 
	on lic.licence_type_id = lictyp.id
	inner join mals_app.mal_status_code_lu stat 
	on lic.status_code_id = stat.id 
	left join mals_app.mal_region_lu rgn 
	on lic.region_id = rgn.id 
	left join mals_app.mal_regional_district_lu dist
	on lic.regional_district_id = dist.id
	left join registrants reg 
	on lic.id = reg.licence_id;	

--
-- VIEW:  MAL_PRINT_CARD_VW
--

CREATE OR REPLACE VIEW mal_print_card_vw as
	with licence_base as (
		select
		    lictyp.licence_type ,
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
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
											'LicenceHolderCompany',  company_name,
											'LicenceNumber',         licence_number,
											'StartDate',             to_char(
																			greatest(issue_date,date_trunc('year', expiry_date) - interval '9 month'), 
																			'FMMonth dd, yyyy'),
											'ExpiryDate',            expiry_date_display)
											order by company_name, licence_number)  
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
			    lic.licence_details,
				lic.bond_number,
				lic.bond_value,
				lic.bond_carrier_name,
				lic.irma_number,
				lic.total_hives,
				reg.primary_phone,
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
			where lic.print_certificate = true),
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
			    row_number() over (partition by s.licence_id order by s.create_timestamp) row_seq
			from mal_licence l
			inner join mal_site s
			on l.id=s.licence_id
			inner join mal_licence_type_lu l_t
			on l.licence_type_id = l_t.id 
			left join mal_status_code_lu stat
			on s.status_code_id = stat.id
			-- Print flag included to improve performance.
			where l.print_certificate = true
			and stat.code_name='ACT'),
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
	    dairy_tank as (
			-- Dairy Farms have only one site.
			select ast.licence_id, 	
		         json_agg(json_build_object('DairyTankCompany',          t.company_name,
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
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'BeeKeeperID',             base.licence_number,
			                       'Phone',                   base.primary_phone,
			                       'Email',                   base.email_address,
			                       'TotalColonies',           base.total_hives,
			                       'ApiarySites',             apiary.apiary_site_json)
		    when 'BULK TANK MILK GRADER' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
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
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ReIssueDate',             base.reissue_date_display,
			                       'SiteDetails',             base.licence_details,
			                       'SiteInformation',         tank.tank_json,
			                       'IRMA_Num',                base.irma_number)
		    when 'FUR FARM' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'Species',                 base.species_description,
			                       'SiteDetails',             licence_details)
		    when 'GAME FARM' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
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
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'SiteDetails',             base.licence_details)
		    when 'LIVESTOCK DEALER' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
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
			                       'MailingAddress',          base.derived_mailing_address,
			                       'MailingCity',             base.derived_mailing_city,
			                       'MailingProv',             base.derived_mailing_province,
			                       'PostCode',                base.derived_mailing_postal_code,
			                       'LicenceName',             base.licence_type,
			                       'LicenceNumber',           base.licence_number,
			                       'IssueDate',               base.issue_date_display,
			                       'ExpiryDate',              base.expiry_date_display,
			                       'SiteDetails',             base.licence_details,
			                       'BondNumber',              base.bond_number,
			                       'BondValue',               base.bond_value,
			                       'BondCarrier',             base.bond_carrier_name,
			                       'BusinessAddressLocation', case 
																  when base.derived_mailing_address = site.address
																  then null 
															  	  else site.address
															  end)
		    when 'SLAUGHTERHOUSE' then
				 json_build_object('ActsAndRegs',             base.licence_type_legislation,
			                       'LicenceHolderName',       base.derived_licence_holder_name,
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
-- VIEW:  MAL_PRINT_DAIRY_FARM_NOTIFICATION_VW
--

create or replace view mal_print_dairy_farm_notification_vw as
	with base as (   
		select rslt.licence_id,
			to_char(current_date, 'fmMonth dd, yyyy') currentdate,
			rslt.irma_number,
		    -- If the Company Name is null then use the First/Last Names
		    coalesce(lic.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) licence_holder_company,
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
			rslt.scc_date,
		    to_char(scc_value, 'fm999999990') scc_value,
			rslt.scc_infraction_flag,
		    case 
		      when scc_levy_percentage is not null
		      then concat(scc_levy_percentage,'%') 
		    end scc_levy_percentage,
			rslt.scc_correspondence_code,
			rslt.cry_date,
		    to_char(cry_value, 'fm990.0') cry_value,
			rslt.cry_infraction_flag,
		    case 
		      when cry_levy_percentage is not null
		      then concat(cry_levy_percentage,'%') 
		    end cry_levy_percentage,
			rslt.cry_correspondence_code,
			rslt.ffa_date,
		    to_char(ffa_value, 'fm990.0') ffa_value,
			rslt.ffa_infraction_flag,
		    case 
		      when ffa_levy_percentage is not null
		      then concat(ffa_levy_percentage,'%') 
		    end ffa_levy_percentage,
			rslt.ffa_correspondence_code,
			rslt.ih_date,
		    to_char(ih_value, 'fm990.00') ih_value,
			rslt.ih_infraction_flag,
		    case 
		      when ih_levy_percentage is not null
		      then concat(ih_levy_percentage,'%') 
		    end ih_levy_percentage,
			rslt.ih_correspondence_code
		from mal_dairy_farm_test_result rslt
		left join mal_licence lic 
		on rslt.licence_id = lic.id 
		left join mal_registrant reg 
		on lic.primary_registrant_id = reg.id
		left join mal_site site 
		on lic.id = site.licence_id)
	--
	--  MAIN QUERY
	--
	select licence_id,
	    'SPC1' species_sub_code,
		spc1_date recorded_date,
	    spc1_correspondence_code correspondence_code,
	    case spc1_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            base.currentdate,      
			                       'IRMA_Num',               base.irma_number,
			                       'LicenceHolderCompany',   base.licence_holder_company,
			                       'MailingAddress',         base.derived_mailing_address,
			                       'MailingCity',            base.derived_mailing_city,
			                       'MailingProv',            base.derived_mailing_province,
			                       'PostCode',               base.derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  base.test_result_create_date,
			                       'LevyMonthYear',          base.levy_month_year,
			                       'DairyTestIBC',           base.spc1_value,
			                       'LevyPercent',            base.spc1_levy_percentage,
			                       'SiteDetails',            base.site_details,
			                       'IssueDate',              base.issue_date)
		  else null
		end infraction_json
	from base
	where spc1_infraction_flag = true
	union all
	select licence_id,
	    'SCC' species_sub_code,
		scc_date recorded_date,
	    scc_correspondence_code correspondence_code,
	    case scc_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            base.currentdate,      
			                       'IRMA_Num',               base.irma_number,
			                       'LicenceHolderCompany',   base.licence_holder_company,
			                       'MailingAddress',         base.derived_mailing_address,
			                       'MailingCity',            base.derived_mailing_city,
			                       'MailingProv',            base.derived_mailing_province,
			                       'PostCode',               base.derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  base.test_result_create_date,
			                       'LevyMonthYear',          base.levy_month_year,
			                       'DairyTestSCC',           base.scc_value,
			                       'LevyPercent',            base.scc_levy_percentage,
			                       'SiteDetails',            base.site_details,
			                       'IssueDate',              base.issue_date)
		  else null
		end infraction_json
	from base
	where scc_infraction_flag = true
	union all
	select licence_id,
	    'CRY' species_sub_code,
		cry_date recorded_date,
	    cry_correspondence_code correspondence_code,
	    case cry_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            base.currentdate,      
			                       'IRMA_Num',               base.irma_number,
			                       'LicenceHolderCompany',   base.licence_holder_company,
			                       'MailingAddress',         base.derived_mailing_address,
			                       'MailingCity',            base.derived_mailing_city,
			                       'MailingProv',            base.derived_mailing_province,
			                       'PostCode',               base.derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  base.test_result_create_date,
			                       'LevyMonthYear',          base.levy_month_year,
			                       'DairyTestCryoPercent',   base.cry_value,
			                       'LevyPercent',            base.cry_levy_percentage,
			                       'SiteDetails',            base.site_details,
			                       'IssueDate',              base.issue_date)
		  else null
		end infraction_json
	from base
	where cry_infraction_flag = true
	union all
	select licence_id,
	    'FFA' species_sub_code,
		ffa_date recorded_date,
	    ffa_correspondence_code correspondence_code,
	    case ffa_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            base.currentdate,      
			                       'IRMA_Num',               base.irma_number,
			                       'LicenceHolderCompany',   base.licence_holder_company,
			                       'MailingAddress',         base.derived_mailing_address,
			                       'MailingCity',            base.derived_mailing_city,
			                       'MailingProv',            base.derived_mailing_province,
			                       'PostCode',               base.derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  base.test_result_create_date,
			                       'LevyMonthYear',          base.levy_month_year,
			                       'DairyTestFFA',           base.ffa_value,
			                       'LevyPercent',            base.ffa_levy_percentage,
			                       'SiteDetails',            base.site_details,
			                       'IssueDate',              base.issue_date)
		  else null
		end infraction_json
	from base
	where ffa_infraction_flag = true
	union all
	select licence_id,
	    'IH' species_sub_code,
		ih_date recorded_date,
	    ih_correspondence_code correspondence_code,
	    case ih_infraction_flag
	      when true 
	      then   json_build_object('CurrentDate',            base.currentdate,      
			                       'IRMA_Num',               base.irma_number,
			                       'LicenceHolderCompany',   base.licence_holder_company,
			                       'MailingAddress',         base.derived_mailing_address,
			                       'MailingCity',            base.derived_mailing_city,
			                       'MailingProv',            base.derived_mailing_province,
			                       'PostCode',               base.derived_mailing_postal_code,
			                       'DairyTestDataLoadDate',  base.test_result_create_date,
			                       'LevyMonthYear',          base.levy_month_year,
			                       'DairyTestIH',            base.ih_value,
			                       'LevyPercent',            base.ih_levy_percentage,
			                       'SiteDetails',            base.site_details,
			                       'IssueDate',              base.issue_date)
		  else null
		end infraction_json
	from base
	where ih_infraction_flag = true;

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
			    spec.code_name species_description,
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
				reg.email_address
			from mal_licence lic
			inner join mal_licence_type_lu lictyp 
			on lic.licence_type_id = lictyp.id 
			-- Most licence types include a standard expiry date, APIARY does not.
			and (   lictyp.licence_type = 'APIARY'
			     or lic.expiry_date = lictyp.standard_expiry_date
			    )
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
				 json_build_object('LastFirstName',         base.registrant_last_name,
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
			                       'ApiarySites',           apiary_site.apiary_site_json) 
		    when 'BULK TANK MILK GRADER' then
				 json_build_object('LicenceYear',           base.standard_expiry_year_display,
			                       'LicenceHolderCompany',  base.company_name,
			                       'LastFirstName',         base.registrant_last_name,
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
			                       'ClientPhoneNumber',     base.registrant_last_name,
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
			                       'SpeciesInventory',      species.species_json)
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
	