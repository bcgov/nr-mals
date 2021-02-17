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

DROP VIEW IF EXISTS mal_licence_summary_vw   CASCADE;
-- Using cascade will drop all dependent Certificate views.
DROP VIEW IF EXISTS mal_certificate_base_vw  CASCADE;

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
-- VIEW:  MAL_CERTIFICATE_BASE_VW
--

 CREATE OR REPLACE VIEW mal_certificate_base_vw as 
	select 
	    lic.id licence_id,
	    cast(lic.licence_number as varchar) licence_number,
	    lictyp.licence_type,
	    lictyp.legislation licence_type_legislation,
	    licstat.code_name licence_status,
	    -- If the Company Name is null then use the First/Last Names
	    coalesce(reg.company_name, nullif(trim(coalesce(reg.first_name,' ')||' '||coalesce(reg.last_name,' ')),'')) company_name,
		-- Either, or both, of the First and Last Names may be null in the legacy data.
		nullif(trim(coalesce(reg.first_name,' ')||' '||coalesce(reg.last_name,' ')),'') registrant_name,	
	    -- Consider the Company Name Override flag to determine the Licence Holder name.
	    case 
		  when reg.company_name_override and reg.company_name is not null 
		  then reg.company_name
		  else nullif(trim(coalesce(reg.first_name,' ')||' '||coalesce(reg.last_name,' ')),'')
		end derived_licence_holder_name,
	    -- Select the mailing address if it exists, otherwise select the main address.
	    case when lic.mail_address_line_1 is null
	      then trim(lic.address_line_1 || ' ' || coalesce(lic.address_line_2,' '))
	      else trim(lic.mail_address_line_1 || ' ' || coalesce(lic.mail_address_line_2,' '))
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
	      then lic.postal_code
	      else lic.mail_postal_code
	    end derived_postal_code,
	    to_char(lic.issue_date, 'FMMonth dd, yyyy') issue_date,
	    to_char(lic.reissue_date, 'FMMonth dd, yyyy') reissue_date,
	    to_char(lic.expiry_date, 'FMMonth dd, yyyy') expiry_date,
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
	    lic.print_certificate, 
	    lic.print_envelope
	from mal_licence lic
	inner join mal_licence_type_lu lictyp 
	on lic.licence_type_id = lictyp.id
    inner join mal_status_code_lu licstat
    on lic.status_code_id = licstat.id 
	inner join mal_registrant reg 
	on lic.primary_registrant_id = reg.id;
	
--
-- VIEW:  MAL_APIARY_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_apiary_certificate_vw as
	with site as (
		-- All Active sites will be included in the repeating JSON group.
		select s.licence_id, 		
	         json_agg(json_build_object('RegistrationNum',  l.licence_number||'-'||s.apiary_site_id,
                                        'Address',          trim(s.address_line_1 || ' ' || coalesce(s.address_line_2,' ')),
                                        'City',             s.city ,
                                        'RegDate',          to_char(s.registration_date, 'yyyy/mm/dd'))
                                        order by s.apiary_site_id) site_json
		from mal_site s
		inner join mal_licence l 
		on s.licence_id=l.id
        left join mal_status_code_lu stat
        on s.status_code_id = stat.id
        where stat.code_name='ACT'
        group by s.licence_id)
	--
	--  MAIN QUERY
	--
	select
	     cbv.licence_id, 
		 cbv.licence_number,
		 cbv.licence_type,
		 cbv.licence_status,
         cbv.print_certificate,
		 json_build_object('LicenceHolderCompany',      cbv.company_name,
	                       'LicenceHolderName',         cbv.registrant_name,
	                       'MailingAddress',            cbv.derived_address,
	                       'MailingCity',               cbv.derived_city,
	                       'MailingProv',               cbv.derived_province,
	                       'PostCode',                  cbv.derived_postal_code,
	                       'BeeKeeperID',               cbv.licence_number,
	                       'Phone',                     cbv.primary_phone,
	                       'Email',                     cbv.email_address,
	                       'ApiarySites',               site.site_json) json_doc
	from mal_certificate_base_vw cbv
	left join site
	on cbv.licence_id=site.licence_id 
	where cbv.licence_type = 'APIARY';
	
--
-- VIEW:  MAL_BULK_TANK_MILK_GRADER_CARD_VW
--

CREATE OR REPLACE VIEW mals_app.mal_bulk_tank_milk_grader_card_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
         -- The Company Name Override flag is not considered as
         -- the Company Name and Reigistrant Name are both required. 
		 json_build_object('LicenceHolderCompany',  company_name,
	                       'LicenceHolderName',     registrant_name,
	                       'LicenceNumber',         licence_number,
	                       'ExpiryDate',            expiry_date) json_doc
	from mal_certificate_base_vw
	where licence_type = 'BULK TANK MILK GRADER';
	
--
-- VIEW:  MAL_BULK_TANK_MILK_GRADER_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_bulk_tank_milk_grader_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
		 json_build_object('ActsAndRegs',        licence_type_legislation,
	                       'LicenceHolderName',  derived_licence_holder_name,
	                       'MailingAddress',     derived_address,
	                       'MailingCity',        derived_city,
	                       'MailingProv',        derived_province,
	                       'PostCode',           derived_postal_code,
	                       'LicenceName',        licence_type,
	                       'LicenceNumber',      licence_number,
	                       'IssueDate',          issue_date,
	                       'ExpiryDate',         expiry_date) json_doc
	from mal_certificate_base_vw
	where licence_type = 'BULK TANK MILK GRADER';

--
-- VIEW:  MAL_DAIRY_FARM_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_dairy_farm_certificate_vw as
	with tank as (
		-- Dairy Farms have only one site.
		select s.licence_id, 	
		     stat.id status_code_id,
	         json_agg(json_build_object('DairyTankCompany',          t.company_name,
	                                    'DairyTankSN',               t.serial_number,
	                                    'DairyTankCapacity',         t.tank_capacity,
	                                    'DairyTankCalibrationDate',  to_char(t.calibration_date, 'yyyy/mm/dd'))
                                        order by t.serial_number, t.calibration_date) tank_json
		from mal_site s
		inner join mal_dairy_farm_tank t 
		on s.id=t.site_id
        inner join mal_status_code_lu stat
        on s.status_code_id = stat.id
        where stat.code_name='ACT'
        group by s.licence_id, stat.id)
	--
	--  MAIN QUERY
	--
	select
	     cbv.licence_id,
		 cbv.licence_number,
		 cbv.licence_type,
		 cbv.licence_status,
		 sitestat.code_name site_status,
         cbv.print_certificate,
		 json_build_object('ActsAndRegs',               cbv.licence_type_legislation,
	                       'LicenceHolderCompany',      cbv.company_name,
	                       'LicenceHolderName',         cbv.registrant_name,
	                       'MailingAddress',            cbv.derived_address,
	                       'MailingCity',               cbv.derived_city,
	                       'MailingProv',               cbv.derived_province,
	                       'PostCode',                  cbv.derived_postal_code,
	                       'LicenceName',               cbv.licence_type,
	                       'LicenceNumber',             cbv.licence_number,
	                       'IssueDate',                 cbv.issue_date,
	                       'ReIssueDate',               cbv.reissue_date,
	                       'SiteDetails',               cbv.licence_details,
	                       'SiteInformation',           tank.tank_json,
	                       'IRMA_Num',                  cbv.irma_number) json_doc
	from mal_certificate_base_vw cbv
	left join tank
	on cbv.licence_id=tank.licence_id 
    left join mal_status_code_lu sitestat
    on tank.status_code_id = sitestat.id 
	where cbv.licence_type = 'DAIRY FARM';
	
--
-- VIEW:  MAL_FUR_FARM_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_fur_farm_certificate_vw as
	with inv as (
		select licence_id, 
		  fur_farm_species_code_id,
		  row_number() over (partition by licence_id order by recorded_date desc) row_seq
		from mal_fur_farm_inventory
		)
	-- 
	--  MAIN QUERY
	-- 
	select
	     cbv.licence_id,
		 cbv.licence_number,
		 cbv.licence_type,
		 cbv.licence_status,
         cbv.print_certificate,
		 json_build_object('ActsAndRegs',        cbv.licence_type_legislation,
	                       'LicenceHolderName',  cbv.derived_licence_holder_name,
	                       'MailingAddress',     cbv.derived_address,
	                       'MailingCity',        cbv.derived_city,
	                       'MailingProv',        cbv.derived_province,
	                       'PostCode',           cbv.derived_postal_code,
	                       'LicenceName',        cbv.licence_type,
	                       'LicenceNumber',      cbv.licence_number,
	                       'IssueDate',          cbv.issue_date,
	                       'ExpiryDate',         cbv.expiry_date,
	                       'Species',            gc.code_description,
	                       'SiteDetails',        cbv.licence_details) json_doc
	from mals_app.mal_certificate_base_vw cbv
	left join inv 
	on cbv.licence_id = inv.licence_id
	and inv.row_seq = 1	
	left join mal_fur_farm_species_code_lu gc 
	on inv.fur_farm_species_code_id = gc.id
	where cbv.licence_type = 'FUR FARM';
	
--
-- VIEW:  MAL_GAME_FARM_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_game_farm_certificate_vw as
	with inv as (
		select licence_id, 
		     game_farm_species_code_id,
		     row_number() over (partition by licence_id order by recorded_date desc) row_seq
		from mal_game_farm_inventory
		),
	  site as (
		-- Game farms should only have one site though a duplicate does exist.
		select s.licence_id, 
		     s.legal_description,
		     row_number() over (partition by s.licence_id order by s.create_timestamp) row_seq
		from mal_site s
        left join mal_status_code_lu stat
        on s.status_code_id = stat.id
        where stat.code_name='ACT')
	--
	--  MAIN QUERY
	--
	select
	     cbv.licence_id licence_id,
		 cbv.licence_number,
		 cbv.licence_type,
		 cbv.licence_status,
         cbv.print_certificate,
		 json_build_object('ActsAndRegs',        cbv.licence_type_legislation,
	                       'LicenceHolderName',  cbv.derived_licence_holder_name,
	                       'MailingAddress',     cbv.derived_address,
	                       'MailingCity',        cbv.derived_city,
	                       'MailingProv',        cbv.derived_province,
	                       'PostCode',           cbv.derived_postal_code,
	                       'LicenceName',        cbv.licence_type,
	                       'LicenceNumber',      cbv.licence_number,
	                       'IssueDate',          cbv.issue_date,
	                       'ExpiryDate',         cbv.expiry_date,
	                       'Species',            gc.code_description,
	                       'LegalDescription',   site.legal_description) json_doc
	from mals_app.mal_certificate_base_vw cbv
	left join inv 
	on cbv.licence_id = inv.licence_id 
	and inv.row_seq = 1	
	left join mal_game_farm_species_code_lu gc 
	on inv.game_farm_species_code_id = gc.id
	left join site
	on cbv.licence_id=site.licence_id 
	and site.row_seq = 1
	where cbv.licence_type = 'GAME FARM';
	
--
-- VIEW:  MAL_HIDE_DEALER_CERTIFICATE_VW
-- 

CREATE OR REPLACE VIEW mals_app.mal_hide_dealer_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
		 json_build_object('ActsAndRegs',        licence_type_legislation,
	                       'LicenceHolderName',  derived_licence_holder_name,
	                       'MailingAddress',     derived_address,
	                       'MailingCity',        derived_city,
	                       'MailingProv',        derived_province,
	                       'PostCode',           derived_postal_code,
	                       'LicenceName',        licence_type,
	                       'LicenceNumber',      licence_number,
	                       'IssueDate',          issue_date,
	                       'ExpiryDate',         expiry_date) json_doc
	from mal_certificate_base_vw
	where licence_type = 'HIDE DEALER';

--
-- VIEW:  MAL_LIMITED_MEDICATED_FEED_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_limited_medicated_feed_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
		 json_build_object('ActsAndRegs',               licence_type_legislation,
	                       'LicenceHolderCompany',      derived_licence_holder_name,
	                       'MailingAddress',            derived_address,
	                       'MailingCity',               derived_city,
	                       'MailingProv',               derived_province,
	                       'PostCode',                  derived_postal_code,
	                       'LicenceName',               licence_type,
	                       'LicenceNumber',             licence_number,
	                       'IssueDate',                 issue_date,
	                       'ExpiryDate',                expiry_date,
	                       'SiteDetails',               licence_details) json_doc
	from mal_certificate_base_vw
	where licence_type = 'LIMITED MEDICATED FEED';
	
--
-- VIEW:  MAL_LIVESTOCK_DEALER_AGENT_CARD_VW
--

CREATE OR REPLACE VIEW mals_app.mal_livestock_dealer_agent_card_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
		 print_certificate,
         -- The Company Name Override flag is not considered as
         -- the Reigistrant Name is required. 
		 json_build_object('LicenceHolderName', registrant_name || '   ' || licence_number) json_doc
	from mal_certificate_base_vw
	where licence_type = 'LIVESTOCK DEALER AGENT';
	
--
-- VIEW:  MAL_LIVESTOCK_DEALER_CARD_VW

CREATE OR REPLACE VIEW mals_app.mal_livestock_dealer_card_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
		 print_certificate,
         -- The Company Name Override flag is not considered as
         -- the Company Name is required. 
		 json_build_object('LicenceHolderName', company_name) json_doc
	from mal_certificate_base_vw
	where licence_type = 'LIVESTOCK DEALER';

--
-- VIEW:  MAL_LIVESTOCK_DEALER_CERTIFICATE_VW
--
	
CREATE OR REPLACE VIEW mals_app.mal_livestock_dealer_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
		 print_certificate,
		 json_build_object('ActsAndRegs',             licence_type_legislation,
	                       'LicenceHolderName',       derived_licence_holder_name,
	                       'MailingAddress',          derived_address,
	                       'MailingCity',             derived_city,
	                       'MailingProv',             derived_province,
	                       'PostCode',                derived_postal_code,
	                       'LicenceName',             licence_type,
	                       'LicenceNumber',           licence_number,
	                       'IssueDate',               issue_date,
	                       'ExpiryDate',              expiry_date,
	                       'BondNumber',              bond_number,
	                       'BondValue',               bond_value,
	                       'BondCarrier',             bond_carrier_name,
	                       'Nominee',                 registrant_name) json_doc
	from mal_certificate_base_vw
	where licence_type = 'LIVESTOCK DEALER';
	
--
-- VIEW:  MAL_MEDICATED_FEED_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_medicated_feed_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
		 json_build_object('ActsAndRegs',               licence_type_legislation,
	                       'LicenceHolderCompany',      derived_licence_holder_name,
	                       'MailingAddress',            derived_address,
	                       'MailingCity',               derived_city,
	                       'MailingProv',               derived_province,
	                       'PostCode',                  derived_postal_code,
	                       'LicenceName',               licence_type,
	                       'LicenceNumber',             licence_number,
	                       'IssueDate',                 issue_date,
	                       'ExpiryDate',                expiry_date) json_doc
	from mal_certificate_base_vw 
	where licence_type = 'MEDICATED FEED';
	
--
-- VIEW:  MAL_PUBLIC_SALE_YARD_OPERATOR_CERTIFICATE_VW
--
CREATE OR REPLACE VIEW mals_app.mal_public_sale_yard_operator_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
		 print_certificate,
		 json_build_object('ActsAndRegs',             licence_type_legislation,
	                       'LicenceHolderName',       derived_licence_holder_name,
	                       'MailingAddress',          derived_address,
	                       'MailingCity',             derived_city,
	                       'MailingProv',             derived_province,
	                       'PostCode',                derived_postal_code,
	                       'LicenceName',             licence_type,
	                       'LicenceNumber',           licence_number,
	                       'IssueDate',               issue_date,
	                       'ExpiryDate',              expiry_date,
	                       'LivestockDealerLicence',  lda_ld_licence_id,
	                       'BondNumber',              bond_number ,
	                       'BondValue',               bond_value ,
	                       'BondCarrier',             bond_carrier_name ,
	                       'SaleYard',                yrd_psyo_business_name) json_doc
	from mal_certificate_base_vw
	where licence_type = 'PUBLIC SALE YARD OPERATOR';

	
--
-- VIEW:  MAL_PURCHASE_LIVE_POULTRY_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_purchase_live_poultry_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
		 print_certificate,
		 json_build_object('ActsAndRegs',             licence_type_legislation,
	                       'LicenceHolderName',       derived_licence_holder_name,
	                       'MailingAddress',          derived_address,
	                       'MailingCity',             derived_city,
	                       'MailingProv',             derived_province,
	                       'PostCode',                derived_postal_code,
	                       'LicenceName',             licence_type,
	                       'LicenceNumber',           licence_number,
	                       'IssueDate',               issue_date,
	                       'ExpiryDate',              expiry_date,
	                       'SiteDetails',             licence_details,
	                       'BondNumber',              bond_number,
	                       'BondValue',               bond_value,
	                       'BondCarrier',             bond_carrier_name) json_doc
	from mal_certificate_base_vw
	where licence_type = 'PURCHASE LIVE POULTRY';
	
--
-- VIEW:  MAL_SLAUGHTERHOUSE_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_slaughterhouse_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
		 print_certificate,
		 json_build_object('ActsAndRegs',             licence_type_legislation,
	                       'LicenceHolderName',       derived_licence_holder_name,
	                       'MailingAddress',          derived_address,
	                       'MailingCity',             derived_city,
	                       'MailingProv',             derived_province,
	                       'PostCode',                derived_postal_code,
	                       'LicenceName',             licence_type,
	                       'LicenceNumber',           licence_number,
	                       'IssueDate',               issue_date,
	                       'ExpiryDate',              expiry_date,
	                       'BondNumber',              bond_number,
	                       'BondValue',               bond_value,
	                       'BondCarrier',             bond_carrier_name) json_doc
	from mal_certificate_base_vw
	where licence_type = 'SLAUGHTERHOUSE';
	
--
-- VIEW:  MAL_VETERINARY_DRUG_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_veterinary_drug_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
		 json_build_object('ActsAndRegs',               licence_type_legislation,
	                       'LicenceHolderCompany',      derived_licence_holder_name,
	                       'MailingAddress',            derived_address,
	                       'MailingCity',               derived_city,
	                       'MailingProv',               derived_province,
	                       'PostCode',                  derived_postal_code,
	                       'LicenceName',               licence_type,
	                       'LicenceNumber',             licence_number,
	                       'IssueDate',                 issue_date,
	                       'ExpiryDate',                expiry_date) json_doc
	from mal_certificate_base_vw
	where licence_type = 'VETERINARY DRUG';
	
--
-- VIEW:  MAL_VETERINARY_DRUG_DISPENSER_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_veterinary_drug_dispenser_certificate_vw as
	select
	     licence_id,
		 licence_number,
		 licence_type,
		 licence_status,
         print_certificate,
		 json_build_object('ActsAndRegs',               licence_type_legislation,
	                       'LicenceHolderName',         derived_licence_holder_name,
	                       'MailingAddress',            derived_address,
	                       'MailingCity',               derived_city,
	                       'MailingProv',               derived_province,
	                       'PostCode',                  derived_postal_code,
	                       'LicenceName',               licence_type,
	                       'LicenceNumber',             licence_number,
	                       'IssueDate',                 issue_date,
	                       'ExpiryDate',                expiry_date) json_doc
	from mal_certificate_base_vw 
	where licence_type = 'DISPENSER';

