SET statement_timeout = 0; 
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;
	

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
	inner join mal_licence_type_lu lictyp 
	on lic.licence_type_id = lictyp.id
	inner join mals_app.mal_status_code_lu stat 
	on lic.status_code_id = stat.id 
	left join mal_registrant reg
	on lic.primary_registrant_id = reg.id
	left join mals_app.mal_region_lu rgn 
	on lic.region_id = rgn.id 
	left join mals_app.mal_regional_district_lu dist
	on lic.regional_district_id = dist.id
	left join mal_licence_species_code_lu sp
	on lic.species_code_id = sp.id;
	