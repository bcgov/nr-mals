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

DROP VIEW IF EXISTS mal_licence_summary_vw    CASCADE;
DROP VIEW IF EXISTS mal_site_detail_vw        CASCADE;
DROP VIEW IF EXISTS mal_print_certificate_vw  CASCADE;
DROP VIEW IF EXISTS mal_print_card_vw         CASCADE;
DROP VIEW IF EXISTS mal_print_renewal_vw      CASCADE;

--
-- VIEW:  MAL_LICENCE_SUMMARY_VW
--

CREATE OR REPLACE VIEW mal_licence_summary_vw as 
with registrants as (
  select 
       x.licence_id 
      ,string_agg(distinct r.last_name, '~' order by r.last_name) last_name
      ,string_agg(distinct r.company_name, '~' order by r.company_name) company_name
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
	,lic.region_id
	,lic.regional_district_id
	,lic.licence_number
	,lic.irma_number
	,lictyp.licence_type
	,reg.last_name
    ,reg.company_name
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
-- VIEW:  MAL_SITE_DETAIL_VW
--

 CREATE OR REPLACE VIEW mal_site_detail_vw as 
	select 	    
	    site.id site_id_pk,	    
	    site.status_code_id site_status_id_fk,
	    sitestat.code_name site_status,
	    lic.status_code_id licence_status_id_fk,
	    licstat.code_name licence_status,	
	    lic.licence_type_id licence_type_id_fk,
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
	    reg.company_name registrant_company_name,
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
    on lic.region_id=r.id 
    left join mal_regional_district_lu rd 
    on lic.regional_district_id=rd.id;
	
--
-- VIEW:  MAL_PRINT_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mal_print_certificate_vw as 
	with licence_base as (
		    select 
			    lic.id licence_id,
			    cast(lic.licence_number as varchar) licence_number,
			    lictyp.licence_type,
			    lictyp.legislation licence_type_legislation,
			    licstat.code_name licence_status,
			    reg.first_name registrant_first_name,
			    reg.last_name registrant_last_name,
			    -- If the Company Name is null then use the First/Last Names
			    coalesce(reg.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
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
				  when reg.company_name_override and reg.company_name is not null 
				  then reg.company_name
				  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
				end derived_licence_holder_name,
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
				lic.lda_ld_licence_id,
				lic.bond_number,
				lic.bond_value,
				lic.bond_carrier_name,
				lic.yrd_psyo_business_name,
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
	        group by ast.licence_id),
	    fur_inventory as (
			select i.licence_id, 
			    gc.code_description species,
			    row_number() over (partition by i.licence_id order by i.recorded_date desc) row_seq
			from mal_licence l
			inner join mal_fur_farm_inventory i
			on l.id = i.licence_id 
			left join mal_fur_farm_species_code_lu gc 
			on i.fur_farm_species_code_id = gc.id
			-- Print flag included to improve performance.
			where l.print_certificate = true),
	    game_inventory as (
			select i.licence_id, 
			    gsc.code_description species,
			    row_number() over (partition by i.licence_id order by i.recorded_date desc) row_seq
			from mal_licence l
			inner join mal_game_farm_inventory i
			on l.id = i.licence_id 
			left join mal_game_farm_species_code_lu gsc 
			on i.game_farm_species_code_id = gsc.id
			-- Print flag included to improve performance.
			where l.print_certificate = true)
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
			                       'Species',                 fi.species,
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
			                       'Species',                 gi.species,
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
			                       'LivestockDealerLicence',  base.lda_ld_licence_id,
			                       'BondNumber',              base.bond_number ,
			                       'BondValue',               base.bond_value ,
			                       'BondCarrier',             base.bond_carrier_name ,
			                       'SaleYard',                base.yrd_psyo_business_name)
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
			json_build_object('RegistrantFirstLast',     base.registrant_last_first,
			                  'MailingAddress',          base.derived_mailing_address,
			                  'MailingCity',             base.derived_mailing_city,
			                  'MailingProv',             base.derived_mailing_province,
			                  'PostCode',                base.derived_mailing_postal_code) envelope_json
	from licence_base base 
	left join apiary_site apiary
	on base.licence_id = apiary.licence_id
	left join fur_inventory fi
	on base.licence_id = fi.licence_id
	and fi.row_seq = 1
	left join game_inventory gi
	on base.licence_id = gi.licence_id 
	and gi.row_seq = 1	
	left join active_site site
	on base.licence_id=site.licence_id 
	and site.row_seq = 1
	left join dairy_tank tank
	on base.licence_id=tank.licence_id 
	where 1=1
	and base.licence_status='ACT';

--
-- VIEW:  MAL_PRINT_CARD_VW
--

CREATE OR REPLACE VIEW mal_print_card_vw as
	with licence_base as (
		select
		    lictyp.licence_type ,
		    coalesce(reg.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
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
-- VIEW:  MAL_BASE_RENEWAL_VW
--

 CREATE OR REPLACE VIEW mal_print_renewal_vw as 
	with licence_base as (
		    select 
			    lic.id licence_id,
			    cast(lic.licence_number as varchar) licence_number,
			    lictyp.licence_type,
			    licstat.code_name licence_status,
			    reg.first_name registrant_first_name,
			    reg.last_name registrant_last_name,
			    -- If the Company Name is null then use the First/Last Names
			    coalesce(reg.company_name, nullif(concat(reg.first_name, ' ', reg.last_name),' ')) company_name,
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
				  when reg.company_name_override and reg.company_name is not null 
				  then reg.company_name
				  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
				end derived_licence_holder_name,
				lic.associated_business_name,
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
			where lic.print_renewal = true),
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
			select l.associated_business_name,
			     json_agg(json_build_object('DispLicenceHolderName', nullif(trim(concat(r.first_name, ' ', r.last_name)),''))
			                                order by nullif(trim(concat(r.first_name, ' ', r.last_name)),'')) dispenser_json
			from mal_licence l
			inner join mal_licence_type_lu t
			on l.licence_type_id = t.id
			inner join mal_registrant r 
			on l.primary_registrant_id =r.id
			where 1 = 1
			and l.associated_business_name is not null
			and t.licence_type in ('DISPENSER')
			and l.print_renewal = true
			group by l.associated_business_name),
		fur_species as (
			select 'FUR FARM' licence_type, 		
			     json_agg(json_build_object('Species',  code_name)
			                                order by code_name) fur_species_json
			from mal_fur_farm_species_code_lu s 
			where active_flag = true),
		game_species as (
			select 'GAME FARM' licence_type, 		
			     json_agg(json_build_object('Species',  code_name)
			                                order by code_name) game_species_json
			from mal_game_farm_species_code_lu s 
			where active_flag = true)
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
			                       'SpeciesInventory',      fur_species.fur_species_json)
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
			                       'SpeciesInventory',      game_species.game_species_json)
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
			                       'LicenceFee',            base.licence_fee_display)
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
	left join fur_species
	on base.licence_type = fur_species.licence_type
	left join game_species
	on base.licence_type = game_species.licence_type
	left join dispenser disp
	on base.licence_type = 'VETERINARY DRUG'
	and base.associated_business_name = disp.associated_business_name;
