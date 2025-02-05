--
-- MALS2-14 - add medicated feed and veterinary drug information to dispenser renewals
--
-- drop view
DROP VIEW mals_app.mal_print_renewal_vw;

-- recreate view with updates
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
            NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
            lic.company_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS derived_company_name,
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
            concat(to_char(lictyp.standard_issue_date, 'yyyy'::text), ' - ', to_char(lictyp.standard_expiry_date, 'yyyy'::text)) AS licence_type_fiscal_year
           FROM mals_app.mal_licence lic
             JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
             LEFT JOIN mals_app.mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
             LEFT JOIN mals_app.mal_licence_species_code_lu spec ON lic.species_code_id = spec.id
             LEFT JOIN mals_app.mal_licence_type_lu sp_lt ON spec.licence_type_id = sp_lt.id
          WHERE lic.print_renewal = true
        ), active_site AS (
         SELECT s.id AS site_id,
            l.id AS licence_id,
            l_t.licence_type,
            s.apiary_site_id,
            s.premises_id,
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
           FROM mals_app.mal_licence l
             JOIN mals_app.mal_site s ON l.id = s.licence_id
             JOIN mals_app.mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mals_app.mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE l.print_renewal = true AND stat.code_name::text = 'ACT'::text AND (l_t.licence_type::text = ANY (ARRAY['APIARY'::character varying::text, 'FUR FARM'::character varying::text, 'GAME FARM'::character varying::text]))
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address, 'City', active_site.city, 'RegDate', active_site.registration_date) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dispenser AS (
         SELECT prnt_lic.id AS parent_licence_id,
            json_agg(json_build_object('DispLicenceHolderName', NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text), 'DispLicenceExpiryDate', to_char(disp_1.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text)) ORDER BY (NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text))) AS dispenser_json
           FROM mals_app.mal_licence prnt_lic
             JOIN mals_app.mal_licence_parent_child_xref xref ON xref.parent_licence_id = prnt_lic.id
             JOIN mals_app.mal_licence disp_1 ON xref.child_licence_id = disp_1.id
             JOIN mals_app.mal_registrant reg ON disp_1.primary_registrant_id = reg.id
             JOIN mals_app.mal_licence_type_lu prnt_ltyp ON prnt_lic.licence_type_id = prnt_ltyp.id
             JOIN mals_app.mal_licence_type_lu disp_ltyp ON disp_1.licence_type_id = disp_ltyp.id
          WHERE disp_ltyp.licence_type::text = 'DISPENSER'::text
          GROUP BY prnt_lic.id
        ), licence_species AS (
         SELECT ltyp.id AS licence_type_id,
            json_agg(json_build_object('Species', spec.code_name) ORDER BY spec.code_name) AS species_json
           FROM mals_app.mal_licence_type_lu ltyp
             JOIN mals_app.mal_licence_species_code_lu spec ON ltyp.id = spec.licence_type_id
          WHERE spec.active_flag = true
          GROUP BY ltyp.id
        ), disp_associated_licences AS (
           SELECT prnt_lic.id AS parent_licence_id,
			 JSON_AGG(
			    JSON_BUILD_OBJECT(
			        'LicenceId', xref.child_licence_id,
			        'LicenceNum', child_lic.licence_number,
			        'CompanyName', child_lic.company_name
				        )
			    	) AS associated_licences
			    FROM mals_app.mal_licence prnt_lic
			      JOIN mals_app.mal_licence_parent_child_xref xref ON xref.parent_licence_id = prnt_lic.id
			      JOIN mals_app.mal_licence child_lic ON xref.child_licence_id = child_lic.id
			      JOIN mals_app.mal_licence_type_lu prnt_ltyp ON prnt_lic.licence_type_id = prnt_ltyp.id
			      JOIN mals_app.mal_licence_type_lu disp_ltyp ON child_lic.licence_type_id = disp_ltyp.id
			  WHERE disp_ltyp.licence_type IN ('MEDICATED FEED', 'VETERINARY DRUG')
			GROUP BY prnt_lic.id
        )
 SELECT base.licence_id,
    base.licence_number,
    base.licence_type,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LastFirstName', base.registrant_last_first, 'LicenceHolderCompany', base.company_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'ExpiryDate', base.expiry_date_display, 'TotalColonies', base.total_hives, 'ApiarySites', apiary_site.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('LicenceYear', base.standard_expiry_year_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'FUR FARM'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'SiteMailingAddress', site.derived_site_mailing_address, 'SiteMailingCity', site.derived_site_mailing_city, 'SiteMailingProv', site.derived_site_mailing_province, 'SitePostCode', site.derived_site_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'SpeciesInventory', species.species_json)
            WHEN 'GAME FARM'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'ClientPhoneNumber', base.registrant_primary_phone_display, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'SiteMailingAddress', site.derived_site_mailing_address, 'SiteMailingCity', site.derived_site_mailing_city, 'SiteMailingProv', site.derived_site_mailing_province, 'SitePostCode', site.derived_site_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'SiteLegalDescription', site.legal_description, 'SitePremisesId', site.premises_id, 'SpeciesInventory', base.species_code)
            WHEN 'HIDE DEALER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIMITED MEDICATED FEED'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderName', base.derived_company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondCarrier', base.bond_carrier_name, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'MEDICATED FEED'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'Dispensers', disp.dispenser_json)
            WHEN 'PUBLIC SALE YARD OPERATOR'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'PURCHASE LIVE POULTRY'::text THEN json_build_object('LicenceHolderName', base.derived_company_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondCarrier', base.bond_carrier_name, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display, 'LicenceTypeFiscalYear', base.licence_type_fiscal_year)
            WHEN 'SLAUGHTERHOUSE'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderName', base.registrant_name, 'LicenceHolderPhone', base.registrant_primary_phone_display, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number)
            WHEN 'VETERINARY DRUG'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'Dispensers', disp.dispenser_json)
            WHEN 'DISPENSER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'PhoneNumber', base.registrant_primary_phone_display, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'AssocLic', COALESCE(disp_assoc.associated_licences, '[]'::json))
            ELSE NULL::json
        END AS renewal_json
   FROM licence_base base
     LEFT JOIN apiary_site ON base.licence_type::text = 'APIARY'::text AND base.licence_id = apiary_site.licence_id
     LEFT JOIN active_site site ON (base.licence_type::text = ANY (ARRAY['FUR FARM'::character varying::text, 'GAME FARM'::character varying::text])) AND base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dispenser disp ON (base.licence_type::text = ANY (ARRAY['MEDICATED FEED'::character varying::text, 'VETERINARY DRUG'::character varying::text])) AND base.licence_id = disp.parent_licence_id
     LEFT JOIN disp_associated_licences disp_assoc ON (base.licence_type::text = ANY (ARRAY['DISPENSER'::character varying::text])) AND base.licence_id = disp_assoc.parent_licence_id
     LEFT JOIN licence_species species ON base.licence_type_id = species.licence_type_id;

--
-- MALS2-20 - Dairy Farm Producers report
--
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_producers(INOUT iop_print_job_id integer)
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
	with producer_details as (
		select 
			json_agg(json_build_object('IRMA_NUM',              producer.irma_number,
										'FarmName',             producer.company_name,
										'FarmAddress',  		producer.site_address,
										'PrincipalName',        producer.registrant_last_first,
										'PrincipalFirstLast',   producer.registrant_first_last,
										'PrincipalPhone',       producer.registrant_primary_phone,
										'PrincipalEmail',       producer.registrant_email_address,
										'SiteContactName',      producer.site_contact_name,
										'SiteContactPhone',     producer.site_primary_phone,
										'SiteContactEmail',     producer.site_email)
		                                order by irma_number) producer_json,
			count(licence_number) total_producers
		from mal_dairy_farm_producer_vw producer
		where licence_status='ACT' and site_status='ACT'
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
		'DAIRY_FARM_PRODUCERS',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Total_Producers',     total_producers,
						  'Reg',                 producer_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from producer_details;
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

GRANT SELECT ON mals_app.mal_dairy_farm_producer_vw TO mals_app_role;

--
-- MALS2-27 - set default country value to Canada when performing a Premises ID import
--
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
						mail_country, ---
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
							'Canada', ---
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
						registration_date,
						address_line_1,							
						premises_id,
						city,
						province,
						country ---
						)
						values (
							l_licence_id,
							l_apiary_site_id,   
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_active_status_id,
							current_date,  -- registration_date,
							l_file_rec.site_address_line_1,
							l_file_rec.source_premises_id,
							upper(l_file_rec.site_city),
							'BC',
							'Canada') ---
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
							premises_id,
							city,
							province,
							country ---
							)
							values (
								l_licence_id,
								l_apiary_site_id,
								l_file_rec.region_id,
								l_file_rec.regional_district_id,
								l_active_status_id,
								current_date,  -- registration_date,
								l_file_rec.site_address_line_1,
								l_file_rec.source_premises_id,
								upper(l_file_rec.site_city),
								'BC',
								'Canada') ---
							returning id into l_site_id;
						-- Update the Licence expiry date.
						update mal_licence
							set expiry_date = current_date + interval '2 years',
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
								mail_country		 = 'Canada',
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
								country				 = 'Canada',
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
-- MALS2-34 - Add PreviousMonth variable to infraction JSON
--
drop view mals_app.mal_print_dairy_farm_infraction_vw;

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
            to_char(GREATEST(rslt.spc1_date, rslt.scc_date, rslt.cry_date, rslt.ffa_date, rslt.ih_date)::timestamp with time zone, 'fmMonth dd, yyyy'::text) AS reported_on_date,
            to_char(rslt.create_timestamp, 'fmMonth dd, yyyy'::text) AS test_result_create_date,
            to_char((((rslt.test_year::character varying::text || to_char(rslt.test_month, 'fm09'::text)) || '01'::text)::date)::timestamp with time zone, 'fmMonth, yyyy'::text) AS levy_month_year,
            btrim(concat(site.address_line_1, ' ', site.address_line_2, ', ', site.city, ', ', site.province, ' ', substr(site.postal_code::text, 1, 3), ' ', substr(site.postal_code::text, 4, 3))) AS site_address,
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
            to_char(rslt.cry_date::timestamp with time zone, 'fmMonth, yyyy'::text) AS cry_month_year,
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
           FROM mals_app.mal_dairy_farm_test_result rslt
             LEFT JOIN mals_app.mal_licence lic ON rslt.licence_id = lic.id
             LEFT JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             LEFT JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_site site ON lic.id = site.licence_id
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
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'PreviousMonth', to_char((date_trunc('month'::text, base.test_result_create_date::date::timestamp with time zone) - '1 day'::interval)::date::timestamp with time zone, 'FMMonth DD, YYYY'::text), 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SPC1', 'DairyTestIBC', base.spc1_value, 'CorrespondenceCode', base.spc1_correspondence_code, 'LevyPercent', base.spc1_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
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
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'PreviousMonth', to_char((date_trunc('month'::text, base.test_result_create_date::date::timestamp with time zone) - '1 day'::interval)::date::timestamp with time zone, 'FMMonth DD, YYYY'::text), 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SCC', 'DairyTestSCC', base.scc_value, 'CorrespondenceCode', base.scc_correspondence_code, 'LevyPercent', base.scc_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
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
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'PreviousMonth', to_char((date_trunc('month'::text, base.test_result_create_date::date::timestamp with time zone) - '1 day'::interval)::date::timestamp with time zone, 'FMMonth DD, YYYY'::text), 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'CRY', 'DairyTestCryoPercent', base.cry_value, 'CorrespondenceCode', base.cry_correspondence_code, 'LevyPercent', base.cry_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date, 'CryMonthYear', base.cry_month_year)
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
    'IH'::text AS species_sub_code,
    base.ih_date AS recorded_date,
    base.ih_correspondence_code AS correspondence_code,
    base.ih_correspondence_description AS correspondence_description,
        CASE base.ih_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'PreviousMonth', to_char((date_trunc('month'::text, base.test_result_create_date::date::timestamp with time zone) - '1 day'::interval)::date::timestamp with time zone, 'FMMonth DD, YYYY'::text), 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'IH', 'DairyTestIH', base.ih_value, 'CorrespondenceCode', base.ih_correspondence_code, 'LevyPercent', base.ih_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.ih_infraction_flag = true;

--
-- MALS2-35 - apiary site summary report procedure
--
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_site_summary(IN ip_region_name character varying, INOUT iop_print_job_id integer)
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
    WITH site_summary AS (
        SELECT 
            lic_region_name,
            lic_district_name,
            licence_number,
            registrant_last_name,
            registrant_first_name,
            registrant_primary_phone,
            registrant_email_address,
            SUM(site_hive_count) AS total_hives_per_licence,
            COUNT(*) AS total_sites_per_licence,
            ARRAY_AGG(apiary_site_id) AS site_ids
        FROM 
            mal_apiary_producer_vw
        WHERE (site_region_name = ip_region_name or
                    ip_region_name = 'ALL')
            AND licence_status = 'ACT'
            AND site_status = 'ACT'
        GROUP BY 
            lic_region_name,
            lic_district_name,
            licence_number,
            registrant_last_name,
            registrant_first_name,
            registrant_primary_phone,
            registrant_email_address
    ), 
    licence_data AS (
        SELECT 
            json_agg(
                json_build_object(
                    'RegionName',   lic_region_name,
                    'DistrictName', lic_district_name,
                    'LicenceNumber', licence_number,
                    'LastName',     registrant_last_name,
                    'FirstName',    registrant_first_name,
                    'PrimaryPhone', registrant_primary_phone,
                    'Email',        registrant_email_address,
                    'Num_Hives',    total_hives_per_licence,
                    'Num_Sites',    total_sites_per_licence,
                    'SiteIDs',      site_ids
                ) ORDER BY licence_number
            ) AS licence_json,
            COUNT(*) AS total_producers,
            SUM(total_hives_per_licence) AS total_hives
        FROM 
            site_summary
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
		'APIARY_SITE_SUMMARY', 
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Reg',                licence_json,
						  'Tot_Producers',      total_producers,
						  'Tot_Hives',          total_hives) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_data;
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
-- MALS2-36 - dairy tank recheck report was including inactive licences
--
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_tank_recheck(IN ip_recheck_year character varying, INOUT iop_print_job_id integer)
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
									   'TankCalibrationDate',     calibration_date_display,
									   'TankCompany',             tank_company_name,
									   'TankModel',               tank_model_number,
									   'TankSerialNo',            tank_serial_number,
									   'TankCapacity',            tank_capacity)) tank_json,
			count(*) num_tanks
		from mal_dairy_farm_tank_vw
		where recheck_year = ip_recheck_year
		and licence_status = 'ACT')
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
		'DAIRY_FARM_TANK',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
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