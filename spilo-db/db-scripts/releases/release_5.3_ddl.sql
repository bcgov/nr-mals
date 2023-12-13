      
--        MALS-1248 - Apiary licenses printing client's name as client and as company on certificates
--				APIARY and BULK TANK MILK GRADER will use Company Name only, and three others
--				 will use a new column named derived_company_name, which has the existing logic.

--
-- VIEW:  MAL_PRINT_CERTIFICATE_VW
--

CREATE OR REPLACE VIEW mals_app.mal_print_certificate_vw AS
	   WITH licence_base AS (
         SELECT lic.id AS licence_id,
            lic.licence_number,
            prnt_lic.licence_number AS parent_licence_number,
            lictyp.licence_type,
            spec.code_name AS species_description,
            lictyp.legislation AS licence_type_legislation,
            licstat.code_name AS licence_status,
            reg.first_name AS registrant_first_name,
            reg.last_name AS registrant_last_name,
            NULLIF(concat(reg.first_name, ' ', reg.last_name), ' ') AS registrant_name,
            CASE
                WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)
                ELSE COALESCE(reg.last_name, reg.first_name)
            END AS registrant_last_first,
            reg.official_title,
            lic.company_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' ')) AS derived_company_name,
            CASE
                WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name
                ELSE NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), '')
            END AS derived_licence_holder_name,
            CASE
                WHEN prnt_lic.company_name_override AND prnt_lic.company_name IS NOT NULL THEN prnt_lic.company_name
                ELSE NULLIF(btrim(concat(prnt_reg.first_name, ' ', prnt_reg.last_name)), '')
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
                WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code, 1, 3), ' ', substr(lic.postal_code, 4, 3))
                ELSE concat(substr(lic.mail_postal_code, 1, 3), ' ', substr(lic.mail_postal_code, 4, 3))
            END AS derived_mailing_postal_code,
            lic.issue_date,
            to_char(lic.issue_date, 'FMMonth dd, yyyy') AS issue_date_display,
            lic.reissue_date,
            to_char(lic.reissue_date, 'FMMonth dd, yyyy') AS reissue_date_display,
            lic.expiry_date,
            to_char(lic.expiry_date, 'FMMonth dd, yyyy') AS expiry_date_display,
            lic.bond_number,
            lic.bond_value,
            lic.bond_carrier_name,
            lic.irma_number,
            lic.total_hives,
            reg.primary_phone,
            CASE
                WHEN reg.primary_phone IS NULL THEN NULL
                ELSE concat('(', substr(reg.primary_phone, 1, 3), ') ', substr(reg.primary_phone, 4, 3), '-', substr(reg.primary_phone, 7, 4))
            END AS registrant_primary_phone_display,
            reg.email_address,
            lic.print_certificate
           FROM mal_licence lic
             JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
             LEFT JOIN mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
             LEFT JOIN mal_registrant prnt_reg ON prnt_lic.primary_registrant_id = prnt_reg.id
             LEFT JOIN mal_licence_species_code_lu spec ON lic.species_code_id = spec.id
             LEFT JOIN mal_licence_type_lu sp_lt ON spec.licence_type_id = sp_lt.id
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
            to_char(s.registration_date, 'yyyy/mm/dd') AS registration_date,
            s.legal_description,
            s.site_details,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mal_licence l
             JOIN mal_site s ON l.id = s.licence_id
             JOIN mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE stat.code_name = 'ACT' AND l.print_certificate = true
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address_1_2, 'City', active_site.city, 'RegDate', active_site.registration_date) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type = 'APIARY'
          GROUP BY active_site.licence_id
        ), dairy_tank AS (
         SELECT ast.licence_id,
            json_agg(json_build_object('DairyTankCompany', t.company_name, 'DairyTankModel', t.model_number, 'DairyTankSN', t.serial_number, 'DairyTankCapacity', t.tank_capacity, 'DairyTankCalibrationDate', to_char(t.calibration_date, 'yyyy/mm/dd')) ORDER BY t.create_timestamp) AS tank_json
           FROM active_site ast
             JOIN mal_dairy_farm_tank t ON ast.site_id = t.site_id
          GROUP BY ast.licence_id
        )
 SELECT base.licence_type,
    base.licence_number,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY' 
            	THEN json_build_object(
            		'LicenceHolderCompany', base.company_name, 
            		'LicenceHolderName', base.registrant_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'BeeKeeperID', base.licence_number, 
            		'Phone', base.registrant_primary_phone_display, 
            		'Email', base.email_address, 
            		'TotalColonies', base.total_hives, 
            		'ApiarySites', apiary.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.registrant_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display)
            WHEN 'DAIRY FARM' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderCompany', base.derived_company_name, 
            		'LicenceHolderName', base.registrant_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ReIssueDate', base.reissue_date_display, 
            		'SiteDetails', site.full_address, 
            		'SiteInformation', tank.tank_json, 
            		'IRMA_Num', base.irma_number)
            WHEN 'FUR FARM' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'Species', base.species_description, 
            		'SiteDetails', site.site_details)
            WHEN 'GAME FARM' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'Species', base.species_description, 
            		'LegalDescription', site.legal_description)
            WHEN 'HIDE DEALER' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display)
            WHEN 'LIMITED MEDICATED FEED' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderCompany', base.derived_company_name, 
            		'LicenceHolderName', base.registrant_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'SiteDetails', site.site_details)
            WHEN 'LIVESTOCK DEALER' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_company_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCityProv', (base.derived_mailing_city || ' ') || base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value, 
            		'BondCarrier', base.bond_carrier_name, 
            		'Nominee', base.registrant_name)
            WHEN 'LIVESTOCK DEALER AGENT' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'AgentFor', base.company_name)
            WHEN 'MEDICATED FEED' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'LicenceHolderName', base.registrant_name, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display)
            WHEN 'PUBLIC SALE YARD OPERATOR' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'LivestockDealerLicence', base.parent_licence_number, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value, 
            		'BondCarrier', base.bond_carrier_name, 
            		'SaleYard', base.derived_parent_licence_holder_name)
            WHEN 'PURCHASE LIVE POULTRY' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'SiteDetails', site.site_details, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value, 
            		'BondCarrier', base.bond_carrier_name, 
            		'BusinessAddressLocation',
				            CASE
				                WHEN base.derived_mailing_address = site.address_1_2 THEN NULL
				                ELSE site.address_1_2
				            END)
            WHEN 'SLAUGHTERHOUSE' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value, 
            		'BondCarrier', base.bond_carrier_name)
            WHEN 'VETERINARY DRUG' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display)
            WHEN 'DISPENSER' 
            	THEN json_build_object(
            		'ActsAndRegs', base.licence_type_legislation, 
            		'LicenceHolderName', base.derived_licence_holder_name, 
            		'LicenceHolderTitle', base.official_title, 
            		'MailingAddress', base.derived_mailing_address, 
            		'MailingCity', base.derived_mailing_city, 
            		'MailingProv', base.derived_mailing_province, 
            		'PostCode', base.derived_mailing_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'IssueDate', base.issue_date_display, 
            		'ExpiryDate', base.expiry_date_display)
            ELSE NULL
        END AS certificate_json,
    json_build_object(
    	'RegistrantLastFirst', base.registrant_last_first, 
    	'MailingAddress', base.derived_mailing_address, 
    	'MailingCity', base.derived_mailing_city, 
    	'MailingProv', base.derived_mailing_province, 
    	'PostCode', base.derived_mailing_postal_code) AS envelope_json
   FROM licence_base base
     LEFT JOIN apiary_site apiary ON base.licence_id = apiary.licence_id
     LEFT JOIN active_site site ON base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dairy_tank tank ON base.licence_id = tank.licence_id
  WHERE 1 = 1 AND base.licence_status = 'ACT';

--        MALS-1246  Renewal Notice for Purchase Live Poultry Incorrect
--          Added DispLicenceExpiryDate key/value pair to the JSON output.
--        MALS-1248 - Apiary licenses printing client's name as client and as company on certificates
--				APIARY and BULK TANK MILK GRADER will use Company Name only, and four others
--				 will use a new column named derived_company_name, which has the existing logic.
 
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
            NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text) AS registrant_name,
            CASE
                WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                ELSE COALESCE(reg.last_name, reg.first_name)
            END AS registrant_last_first,
            lic.company_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' ')) AS derived_company_name,
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
          WHERE l.print_renewal = true AND stat.code_name::text = 'ACT'::text 
          	AND (l_t.licence_type::text = 
          	ANY (ARRAY['APIARY'::character varying::text, 'FUR FARM'::character varying::text, 'GAME FARM'::character varying::text]))
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(
            	json_build_object(
            		'RegistrationNum', active_site.registration_number, 
            		'Address', active_site.address, 
            		'City', active_site.city, 
            		'RegDate', active_site.registration_date
            		) ORDER BY active_site.apiary_site_id
            	) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dispenser AS (
         SELECT prnt_lic.id AS parent_licence_id,
            json_agg(json_build_object(
               'DispLicenceHolderName', NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text),
               'DispLicenceExpiryDate', to_char(disp_1.expiry_date, 'FMMonth dd, yyyy'::text)
               )
               ORDER BY (NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text))
               ) AS dispenser_json
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
            WHEN 'APIARY'::text 
            	THEN json_build_object(
            		'LastFirstName', base.registrant_last_first, 
            		'LicenceHolderCompany', base.company_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'BeeKeeperID', base.licence_number, 
            		'Phone', base.registrant_primary_phone_display, 
            		'Email', base.email_address, 
            		'ExpiryDate', base.expiry_date_display, 
            		'TotalColonies', base.total_hives, 
            		'ApiarySites', apiary_site.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text 
            	THEN json_build_object(
            		'LicenceYear', base.standard_expiry_year_display, 
            		'LicenceHolderCompany', base.company_name, 
            		'LastFirstName', base.registrant_last_first, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display)
            WHEN 'FUR FARM'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'SiteMailingAddress', site.derived_site_mailing_address, 
            		'SiteMailingCity', site.derived_site_mailing_city, 
            		'SiteMailingProv', site.derived_site_mailing_province, 
            		'SitePostCode', site.derived_site_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'SpeciesInventory', species.species_json)
            WHEN 'GAME FARM'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'ClientPhoneNumber', base.registrant_primary_phone_display, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'SiteMailingAddress', site.derived_site_mailing_address, 
            		'SiteMailingCity', site.derived_site_mailing_city, 
            		'SiteMailingProv', site.derived_site_mailing_province, 
            		'SitePostCode', site.derived_site_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'SiteLegalDescription', site.legal_description, 
            		'SpeciesInventory', base.species_code)
            WHEN 'HIDE DEALER'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display)
            WHEN 'LIMITED MEDICATED FEED'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER AGENT'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_company_name, 
            		'LastFirstName', base.registrant_last_first, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderName', base.derived_company_name, 
            		'LastFirstName', base.registrant_last_first, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'BondCarrier', base.bond_carrier_name, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value_display)
            WHEN 'MEDICATED FEED'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'Dispensers', disp.dispenser_json)
            WHEN 'PUBLIC SALE YARD OPERATOR'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_company_name, 
            		'LastFirstName', base.registrant_last_first, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value_display)
            WHEN 'PURCHASE LIVE POULTRY'::text 
            	THEN json_build_object(
            		'LicenceHolderName', base.derived_company_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'BondCarrier', base.bond_carrier_name, 
            		'BondNumber', base.bond_number, 
            		'BondValue', base.bond_value_display, 
            		'LicenceTypeFiscalYear', base.licence_type_fiscal_year)
            WHEN 'SLAUGHTERHOUSE'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderName', base.registrant_name, 
            		'LicenceHolderPhone', base.registrant_primary_phone_display, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number)
            WHEN 'VETERINARY DRUG'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LicenceHolderCompany', base.derived_licence_holder_name, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display, 
            		'Dispensers', disp.dispenser_json)
            WHEN 'DISPENSER'::text 
            	THEN json_build_object(
            		'LicenceStart', base.standard_issue_date_display, 
            		'LicenceExpiry', base.standard_expiry_date_display, 
            		'LastFirstName', base.registrant_last_first, 
            		'MailingAddress', base.derived_address, 
            		'MailingCity', base.derived_city, 
            		'MailingProv', base.derived_province, 
            		'PostCode', base.derived_postal_code, 
            		'PhoneNumber', base.registrant_primary_phone_display, 
            		'LicenceName', base.licence_type, 
            		'LicenceNumber', base.licence_number, 
            		'LicenceFee', base.licence_fee_display)
            ELSE NULL::json
        END AS renewal_json
   FROM licence_base base
     LEFT JOIN apiary_site ON base.licence_type::text = 'APIARY'::text 
     	AND base.licence_id = apiary_site.licence_id
     LEFT JOIN active_site site ON (base.licence_type::text = ANY (ARRAY['FUR FARM'::character varying::text, 'GAME FARM'::character varying::text])) 
     	AND base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dispenser disp ON (base.licence_type::text = ANY (ARRAY['MEDICATED FEED'::character varying::text, 'VETERINARY DRUG'::character varying::text])) 
     	AND base.licence_id = disp.parent_licence_id
     LEFT JOIN licence_species species ON base.licence_type_id = species.licence_type_id;
     
  
--
--        MALS-1253  Add a column for postal codes to the Apiary_Site_Report
--          Add a column for Site postal codes to the view and procedure
--        MALS-1189  Producer Analysis Report by Region not calculating correctly
--          Add Licence Region, District and City to support updates to the Apiary Producer report updates.
--          The colums did not get used by the proc as direction ws given to switch to use the Licence hive counts.
--
-- VIEW:   MAL_APIARY_PRODUCER_VW
--
DROP VIEW mals_app.mal_apiary_producer_vw;
--
CREATE VIEW mals_app.mal_apiary_producer_vw
AS SELECT site.id AS site_id,
    lic.id AS licence_id,
    lic.licence_number,
    lic.primary_registrant_id,
    lic_stat.code_name AS licence_status,
    site_stat.code_name AS site_status,
    site.apiary_site_id,
    reg.id AS registrant_id,
    reg.last_name AS registrant_last_name,
    reg.first_name AS registrant_first_name,
    reg.primary_phone AS registrant_primary_phone,
    reg.email_address AS registrant_email_address,
    -- Regions
    lic.region_id AS lic_region_id,
    COALESCE(lic_rgn.region_name, 'UNKNOWN') AS lic_region_name,
    site.region_id AS site_region_id,
    COALESCE(site_rgn.region_name, 'UNKNOWN') AS site_region_name,
    -- Districts
    lic.regional_district_id AS lic_regional_district_id,
    COALESCE(lic_dist.district_name, 'UNKNOWN') AS lic_district_name,
    site.regional_district_id AS site_regional_district_id,
    COALESCE(site_dist.district_name, 'UNKNOWN') AS site_district_name,
    --
    COALESCE(lic.city, 'UNKNOWN') AS lic_city,
    TRIM(BOTH FROM concat(site.address_line_1, ' ', site.address_line_2)) AS site_address,
    COALESCE(site.city, 'UNKNOWN') AS site_city,
    COALESCE(site.postal_code, 'UNKNOWN') AS site_postal_code,
    site.primary_phone AS site_primary_phone,
    site.registration_date,
    lic.total_hives AS licence_hive_count,
    COALESCE(site.hive_count, 0) AS site_hive_count
   FROM mal_licence lic
     JOIN mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mal_site site ON lic.id = site.licence_id
     JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     LEFT JOIN mal_region_lu lic_rgn ON lic.region_id = lic_rgn.id
     LEFT JOIN mal_region_lu site_rgn ON site.region_id = site_rgn.id
     LEFT JOIN mal_regional_district_lu lic_dist ON lic.regional_district_id = lic_dist.id
     LEFT JOIN mal_regional_district_lu site_dist ON site.regional_district_id = site_dist.id
     LEFT JOIN mal_status_code_lu lic_stat ON lic.status_code_id = lic_stat.id
     LEFT JOIN mal_status_code_lu site_stat ON site.status_code_id = site_stat.id
  WHERE lictyp.licence_type = 'APIARY';
-- 
GRANT SELECT ON TABLE mals_app.mal_apiary_producer_vw TO mals_app_role;

--        MALS-1250  Apiary Site Number Missing from Apiary Site Report
--          Added ApiarySiteID to the JSON output
--
-- PROCEDURE:   PR_GENERATE_PRINT_JSON_APIARY_SITE
--
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_site(IN ip_region_name character varying, INOUT iop_print_job_id integer)
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
										   'ApiarySiteID',        apiary_site_id,
										   'LastName',            registrant_last_name,
										   'FirstName',           registrant_first_name,
										   'PrimaryPhone',        registrant_primary_phone,
										   'Email',               registrant_email_address,
										   'Num_Colonies',        site_hive_count,
										   'Address',             site_address,
										   'City',                site_city,
										   'PostCode',            site_postal_code,
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
--
--
--        MALS-1249  Dairy Test Inventory showing FFA Warning & Penalties being issued - this is incorrect
--          Deleted existing Wartning and Penalties data. Removed functionality to populate those columns, from the stored procedure.
--
-- UPDATE:  DAIRY_FARM_TEST_RESULT
--
		 update mal_dairy_farm_test_result
		 set 
		 	ffa_levy_percentage               = null,
		 	ffa_correspondence_code           = null,
		 	ffa_correspondence_description    = null
		 where ffa_infraction_flag;
--
-- PROCEDURE:   PR_UPDATE_DAIRY_FARM_TEST_RESULTS
--
CREATE OR REPLACE PROCEDURE mals_app.pr_update_dairy_farm_test_results(
	IN ip_job_id integer, 
	IN ip_source_row_count integer, 
	INOUT iop_job_status character varying, 
	INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_target_insert_count     integer default 0;
	l_target_update_count  integer default 0;
  begin
	-- Update those columns which are derived from the inserted results.
	with src as (
		select * 
		from mal_dairy_farm_test_infraction_vw 
		where test_job_id = ip_job_id)
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
			ffa_levy_percentage                  = null,
			ffa_correspondence_code              = null,
			ffa_correspondence_description       = null,
		    ih_date                              = src.ih_date,
		    ih_infraction_flag                   = src.ih_infraction_flag,
		    ih_previous_infraction_first_date    = src.ih_previous_infraction_first_date,
		    ih_previous_infraction_count         = src.ih_previous_infraction_count,
			ih_levy_percentage                   = src.ih_levy_percentage,
			ih_correspondence_code               = src.ih_correspondence_code,
			ih_correspondence_description        = src.ih_correspondence_description
	    from src
	    where tgt.id = src.test_result_id;
		GET DIAGNOSTICS l_target_update_count = ROW_COUNT;
	-- Determine the process status.
	select count(licence_id)
	into l_target_insert_count
	from mal_dairy_farm_test_result
	where test_job_id = ip_job_id;
	iop_job_status := case 
                        when ip_source_row_count = l_target_update_count and 
                             ip_source_row_count = l_target_insert_count
                        then 'COMPLETE'
                        else 'WARNING'
                      end;
	iop_process_comments := concat( 'Source count: ', ip_source_row_count,
								   ', Insert count: ',l_target_insert_count,  
                                   ', Update count: ',l_target_update_count);
	-- Update the Job table.
	update mal_dairy_farm_test_job 
		set
			job_status              = iop_job_status,
			execution_end_time      = current_timestamp,
			source_row_count        = ip_source_row_count,
			target_insert_count     = l_target_insert_count,
			target_update_count     = l_target_update_count,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
end; 
$procedure$
;
		
--        MALS-1189  Producer Analysis Report by Region not calculating correctly
--          Add Licence Region, District and City to support updates to the 
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
--
with registrant_region_summary as (
		select coalesce(lic_rgn.region_name, 'UNKNOWN') lic_region_name,
			lic.id licence_id,
			lic.primary_registrant_id,
			coalesce(sum(lic.total_hives), 0) total_hives,
			count(case
					when lic.total_hives = 0 or lic.total_hives is null 
					then 1 
					else null 
				end) num_producers_hives_0
	   from mal_licence lic
	     join mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
	     left join mal_region_lu lic_rgn ON lic.region_id = lic_rgn.id
	     --left join mal_regional_district_lu lic_dist ON lic.regional_district_id = lic_dist.id
	     left join mal_status_code_lu lic_stat ON lic.status_code_id = lic_stat.id
		where lictyp.licence_type = 'APIARY'
		and lic_stat.code_name = 'ACT'  -- Added 2023-11-09
		group by coalesce(lic_rgn.region_name, 'UNKNOWN'),
			lic.id,
			lic.primary_registrant_id),
	region_summary as (
		select lic_region_name,
			count(distinct case when total_hives between 1 and  9 then primary_registrant_id else null end) num_registrants_1to9,
			count(distinct case when total_hives >= 10            then primary_registrant_id else null end) num_registrants_10plus,
			count(distinct case when total_hives between 1 and 19 then primary_registrant_id else null end) num_registrants_1to19,
			count(distinct case when total_hives >= 20            then primary_registrant_id else null end) num_registrants_20plus,
			count(distinct primary_registrant_id) num_registrants,
			count(distinct case when total_hives between 1 and  9 then licence_id else null end) num_licences_1to9,
			count(distinct case when total_hives >= 10            then licence_id else null end) num_licences_10plus,
			count(distinct case when total_hives between 1 and 19 then licence_id else null end) num_licences_1to19,
			count(distinct case when total_hives >= 20            then licence_id else null end) num_licences_20plus,
			count(distinct licence_id) num_licences,
			sum(case when total_hives between 1 and  9 then total_hives else 0 end) num_hives_1to9,
			sum(case when total_hives >= 10            then total_hives else 0 end) num_hives_10plus,
			sum(case when total_hives between 1 and 19 then total_hives else 0 end) num_hives_1to19,
			sum(case when total_hives >= 20            then total_hives else 0 end) num_hives_20plus,
			sum(total_hives) num_hives,
			sum(num_producers_hives_0) num_producers_hives_0
		from registrant_region_summary
		group by lic_region_name),
	region_json as (
		select 
			json_agg(json_build_object('RegionName',         lic_region_name,
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
		                                order by lic_region_name) json_doc
		from region_summary),
	report_totals as (
		select 
			sum(num_registrants_1to9)   total_registrants_1To9,
			sum(num_registrants_10plus) total_registrants_10Plus,
			sum(num_registrants_1to19)  total_registrants_1To19,
			sum(num_registrants_20plus) total_registrants_20Plus,	
			sum(num_registrants)        total_registrants,				
			sum(num_licences_1to9)      total_licences_1to9,
			sum(num_licences_10plus)    total_licences_10plus,
			sum(num_licences_1to19)     total_licences_1to19,
			sum(num_licences_20plus)    total_licences_20plus,
			sum(num_licences)           total_licences,		
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
						  'Region',                    dj.json_doc,
						  'TotalProducers1To9',        rt.total_registrants_1To9,
						  'TotalProducers10Plus',      rt.total_registrants_10Plus,
						  'TotalProducers1To19',       rt.total_registrants_1To19,
						  'TotalProducers20Plus',      rt.total_registrants_20Plus,
						  'TotalNumProducers',         rt.total_registrants,
						  'TotalColonies1To9',         rt.total_hives_1To9,
						  'TotalColonies10Plus',       rt.total_hives_10Plus,
						  'TotalColonies1To19',        rt.total_hives_1To19,
						  'TotalColonies20Plus',       rt.total_hives_20Plus,
						  'TotalNumColonies',          rt.total_hives,
						  'ProducersWithNoColonies',   rt.total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from region_json dj
cross join report_totals rt;
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
--
with registrant_district_summary as (
		select coalesce(lic_dist.district_name, 'UNKNOWN') lic_district_name,
			lic.id licence_id,
			lic.primary_registrant_id,
			coalesce(sum(lic.total_hives), 0) total_hives,
			count(case
					when lic.total_hives = 0 or lic.total_hives is null 
					then 1 
					else null 
				end) num_producers_hives_0
	   from mal_licence lic
	     join mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
	     --left join mal_region_lu lic_rgn ON lic.region_id = lic_rgn.id
	     left join mal_regional_district_lu lic_dist ON lic.regional_district_id = lic_dist.id
	     left join mal_status_code_lu lic_stat ON lic.status_code_id = lic_stat.id
		where lictyp.licence_type = 'APIARY'
		and lic_stat.code_name = 'ACT'  -- Added 2023-11-09
		group by coalesce(lic_dist.district_name, 'UNKNOWN'),
			lic.id,
			lic.primary_registrant_id),
	district_summary as (
		select lic_district_name,
			count(distinct case when total_hives between 1 and  9 then primary_registrant_id else null end) num_registrants_1to9,
			count(distinct case when total_hives >= 10            then primary_registrant_id else null end) num_registrants_10plus,
			count(distinct case when total_hives between 1 and 19 then primary_registrant_id else null end) num_registrants_1to19,
			count(distinct case when total_hives >= 20            then primary_registrant_id else null end) num_registrants_20plus,
			count(distinct primary_registrant_id) num_registrants,
			count(distinct case when total_hives between 1 and  9 then licence_id else null end) num_licences_1to9,
			count(distinct case when total_hives >= 10            then licence_id else null end) num_licences_10plus,
			count(distinct case when total_hives between 1 and 19 then licence_id else null end) num_licences_1to19,
			count(distinct case when total_hives >= 20            then licence_id else null end) num_licences_20plus,
			count(distinct licence_id) num_licences,
			sum(case when total_hives between 1 and  9 then total_hives else 0 end) num_hives_1to9,
			sum(case when total_hives >= 10            then total_hives else 0 end) num_hives_10plus,
			sum(case when total_hives between 1 and 19 then total_hives else 0 end) num_hives_1to19,
			sum(case when total_hives >= 20            then total_hives else 0 end) num_hives_20plus,
			sum(total_hives) num_hives,
			sum(num_producers_hives_0) num_producers_hives_0
		from registrant_district_summary
		group by lic_district_name),
	district_json as (
		select 
			json_agg(json_build_object('DistrictName',       lic_district_name,
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
		                                order by lic_district_name) json_doc
		from district_summary),
	report_totals as (
		select 
			sum(num_registrants_1to9)   total_registrants_1To9,
			sum(num_registrants_10plus) total_registrants_10Plus,
			sum(num_registrants_1to19)  total_registrants_1To19,
			sum(num_registrants_20plus) total_registrants_20Plus,	
			sum(num_registrants)        total_registrants,				
			sum(num_licences_1to9)      total_licences_1to9,
			sum(num_licences_10plus)    total_licences_10plus,
			sum(num_licences_1to19)     total_licences_1to19,
			sum(num_licences_20plus)    total_licences_20plus,
			sum(num_licences)           total_licences,		
			sum(num_hives_1to9)         total_hives_1To9,
			sum(num_hives_10plus)       total_hives_10Plus,
			sum(num_hives_1to19)        total_hives_1To19,
			sum(num_hives_20plus)       total_hives_20Plus,
			sum(num_hives)              total_hives,
			sum(num_producers_hives_0)  total_producers_hives_0
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
						  'District',                  dj.json_doc,
						  'TotalProducers1To9',        rt.total_registrants_1To9,
						  'TotalProducers10Plus',      rt.total_registrants_10Plus,
						  'TotalProducers1To19',       rt.total_registrants_1To19,
						  'TotalProducers20Plus',      rt.total_registrants_20Plus,
						  'TotalNumProducers',         rt.total_registrants,
						  'TotalColonies1To9',         rt.total_hives_1To9,
						  'TotalColonies10Plus',       rt.total_hives_10Plus,
						  'TotalColonies1To19',        rt.total_hives_1To19,
						  'TotalColonies20Plus',       rt.total_hives_20Plus,
						  'TotalNumColonies',          rt.total_hives,
						  'ProducersWithNoColonies',   rt.total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from district_json dj
cross join report_totals rt;
end; 
$procedure$
;  

