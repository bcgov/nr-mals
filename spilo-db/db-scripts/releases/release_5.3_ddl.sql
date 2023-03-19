SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;
	

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
    
    
    
 
 
  