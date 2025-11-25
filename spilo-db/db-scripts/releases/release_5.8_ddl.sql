----
-- MALS2-61 - Add premises ID to apiary sites report
----

-- Update the view to include site_premises_id variable
CREATE OR REPLACE VIEW mals_app.mal_apiary_producer_vw
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
    lic.region_id AS lic_region_id,
    COALESCE(lic_rgn.region_name, 'UNKNOWN'::character varying) AS lic_region_name,
    site.region_id AS site_region_id,
    COALESCE(site_rgn.region_name, 'UNKNOWN'::character varying) AS site_region_name,
    lic.regional_district_id AS lic_regional_district_id,
    COALESCE(lic_dist.district_name, 'UNKNOWN'::character varying) AS lic_district_name,
    site.regional_district_id AS site_regional_district_id,
    COALESCE(site_dist.district_name, 'UNKNOWN'::character varying) AS site_district_name,
    COALESCE(lic.city, 'UNKNOWN'::character varying) AS lic_city,
    TRIM(BOTH FROM concat(site.address_line_1, ' ', site.address_line_2)) AS site_address,
    COALESCE(site.city, 'UNKNOWN'::character varying) AS site_city,
    COALESCE(site.postal_code, 'UNKNOWN'::character varying) AS site_postal_code,
    site.primary_phone AS site_primary_phone,
    site.registration_date,
    lic.total_hives AS licence_hive_count,
    COALESCE(site.hive_count, 0) AS site_hive_count,
    site.premises_id AS site_premises_id
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     LEFT JOIN mals_app.mal_region_lu lic_rgn ON lic.region_id = lic_rgn.id
     LEFT JOIN mals_app.mal_region_lu site_rgn ON site.region_id = site_rgn.id
     LEFT JOIN mals_app.mal_regional_district_lu lic_dist ON lic.regional_district_id = lic_dist.id
     LEFT JOIN mals_app.mal_regional_district_lu site_dist ON site.regional_district_id = site_dist.id
     LEFT JOIN mals_app.mal_status_code_lu lic_stat ON lic.status_code_id = lic_stat.id
     LEFT JOIN mals_app.mal_status_code_lu site_stat ON site.status_code_id = site_stat.id
  WHERE lictyp.licence_type::text = 'APIARY'::text;


-- Update the procedure to include the premises ID value in the json output
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
										   'Num_Hives',           licence_hive_count,
										   'PremisesID',          site_premises_id)
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


----
-- MALS2-45 - Don't include inactive sites in the Dairy Client Details report
----
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(IN ip_irma_number character varying, IN ip_start_date date, IN ip_end_date date, INOUT iop_print_job_id integer)
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
		and tank.site_status='ACT'
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

----
-- MALS2-47 - Update parts of the renewal and certificate views to include the site premises ID
----
-- mals_app.mal_print_certificate_vw source

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
            NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
            reg.official_title,
            lic.company_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS derived_company_name,
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
            s.premises_id,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mals_app.mal_licence l
             JOIN mals_app.mal_site s ON l.id = s.licence_id
             JOIN mals_app.mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mals_app.mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE stat.code_name::text = 'ACT'::text AND l.print_certificate = true
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address_1_2, 'City', active_site.city, 'RegDate', active_site.registration_date, 'PremisesID', active_site.premises_id) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dairy_tank AS (
         SELECT ast.licence_id,
            json_agg(json_build_object('DairyTankCompany', t.company_name, 'DairyTankModel', t.model_number, 'DairyTankSN', t.serial_number, 'DairyTankCapacity', t.tank_capacity, 'DairyTankCalibrationDate', to_char(t.calibration_date, 'yyyy/mm/dd'::text)) ORDER BY t.create_timestamp) AS tank_json
           FROM active_site ast
             JOIN mals_app.mal_dairy_farm_tank t ON ast.site_id = t.site_id
          GROUP BY ast.licence_id
        ), dairy_trailer AS (
         SELECT lic.licence_id,
            json_agg(json_build_object('TrailerID', (lic.licence_number || '-'::text) || trlr.licence_trailer_seq, 'TrailerNumber', trlr.trailer_number, 'GeographicalDivision', trlr.geographical_division, 'SerialNumberVIN', trlr.serial_number_vin, 'LicencePlate', trlr.license_plate, 'TrailerYear', trlr.trailer_year, 'TrailerMake', trlr.trailer_make, 'TrailerType', trlr.trailer_type, 'TrailerCapacity', trlr.trailer_capacity, 'TrailerCompartments', trlr.trailer_compartments)) AS trailer_json
           FROM licence_base lic
             JOIN mals_app.mal_dairy_farm_trailer trlr ON lic.licence_id = trlr.licence_id
          GROUP BY lic.licence_id
        )
 SELECT base.licence_type,
    base.licence_number,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'TotalColonies', base.total_hives, 'ApiarySites', apiary.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'DAIRY FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ReIssueDate', base.reissue_date_display, 'SiteDetails', site.full_address, 'SiteInformation', tank.tank_json, 'IRMA_Num', base.irma_number)
            WHEN 'DAIRY TANK TRUCK'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'LicencedTrailers', trailer.trailer_json)
            WHEN 'FUR FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'Species', base.species_description, 'SiteDetails', site.site_details)
            WHEN 'GAME FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'Species', base.species_description, 'LegalDescription', site.legal_description)
            WHEN 'HIDE DEALER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'LIMITED MEDICATED FEED'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'SiteDetails', site.site_details)
            WHEN 'LIVESTOCK DEALER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_company_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCityProv', (base.derived_mailing_city::text || ' '::text) || base.derived_mailing_province::text, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'Nominee', base.registrant_name)
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
     LEFT JOIN dairy_trailer trailer ON base.licence_id = trailer.licence_id
  WHERE 1 = 1 AND base.licence_status::text = 'ACT'::text;

-- mals_app.mal_print_renewal_vw source

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
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address, 'City', active_site.city, 'RegDate', active_site.registration_date, 'PremisesID', active_site.premises_id) ORDER BY active_site.apiary_site_id) AS apiary_site_json
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
            json_agg(json_build_object('LicenceId', xref.child_licence_id, 'LicenceNum', child_lic.licence_number, 'CompanyName', child_lic.company_name)) AS associated_licences
           FROM mals_app.mal_licence prnt_lic
             JOIN mals_app.mal_licence_parent_child_xref xref ON xref.parent_licence_id = prnt_lic.id
             JOIN mals_app.mal_licence child_lic ON xref.child_licence_id = child_lic.id
             JOIN mals_app.mal_licence_type_lu prnt_ltyp ON prnt_lic.licence_type_id = prnt_ltyp.id
             JOIN mals_app.mal_licence_type_lu disp_ltyp ON child_lic.licence_type_id = disp_ltyp.id
          WHERE disp_ltyp.licence_type::text = ANY (ARRAY['MEDICATED FEED'::character varying, 'VETERINARY DRUG'::character varying]::text[])
          GROUP BY prnt_lic.id
        )
 SELECT DISTINCT ON (base.licence_id) base.licence_id,
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

----
-- MALS2-46 - Dairy Farm License Reissue Date
----
-- Add table to track reissue_licence dates, this table is used by the dairy client details report
CREATE TABLE mals_app.mal_licence_reissue_date (
    id integer generated always as identity (start with 1 increment by 1) NOT NULL,
    reissue_date DATE NOT NULL,
    licence_id INTEGER NOT NULL REFERENCES mals_app.mal_licence(id),
    licence_number VARCHAR(30) NOT NULL,
    licence_type_id INTEGER NOT NULL REFERENCES mals_app.mal_licence_type_lu(id),
    irma_number VARCHAR(5),
    create_userid varchar(63) NOT NULL,
    create_timestamp timestamp NOT NULL,
    update_userid varchar(63) NOT NULL,
    update_timestamp timestamp NOT NULL
);
ALTER TABLE mals_app.mal_licence_reissue_date ADD PRIMARY KEY (id);
-- Grant roles
grant select, insert, update, delete on mal_licence_reissue_date to mals_app_role;
-- Add reissue_licence column
ALTER TABLE mals_app.mal_licence ADD COLUMN reissue_licence boolean DEFAULT false;

-- Update dairy farm details procedure to include ReissueDates
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(IN ip_irma_number character varying, IN ip_start_date date, IN ip_end_date date, INOUT iop_print_job_id integer)
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
										'Avg_IH',                to_char(dtl.average_ih,'fm9999990.0'),
										'ReissueDates',          tank.reissue_dates)
		                                order by licence_number, tank_create_timestamp) licence_json
		from mal_dairy_farm_tank_vw tank
		left join tank_details dtl
		on tank.licence_id = dtl.licence_id
		where tank.irma_number = ip_irma_number
		and tank.site_status='ACT'
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

-- Update dairy farm tank view to include reissue dates
CREATE OR REPLACE VIEW mals_app.mal_dairy_farm_tank_vw
AS SELECT dft.id AS dairy_farm_tank_id,
    dft.site_id,
    lic.id AS licence_id,
    lic.licence_number,
    lic.irma_number,
    licstat.code_name AS licence_status,
    lic.company_name,
        CASE
            WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name::text
            ELSE NULLIF(TRIM(BOTH FROM concat(reg.first_name, ' ', reg.last_name)), ''::text)
        END AS derived_licence_holder_name,
        CASE
            WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
            ELSE COALESCE(reg.last_name, reg.first_name)
        END AS registrant_last_first,
    TRIM(BOTH FROM concat(lic.address_line_1, ' ', lic.address_line_2)) AS address,
    lic.city,
    lic.province,
    lic.postal_code,
    reg.primary_phone AS registrant_primary_phone,
    reg.secondary_phone AS registrant_secondary_phone,
    reg.fax_number AS registrant_fax_number,
    reg.email_address AS registrant_email_address,
    lic.issue_date,
    to_char(lic.issue_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS issue_date_display,
    sitestat.code_name AS site_status,
    TRIM(BOTH FROM concat(site.address_line_1, ' ', site.address_line_2)) AS site_address,
    site.city AS site_city,
    site.province AS site_province,
    site.postal_code AS site_postal_code,
    site.inspector_name,
    site.inspection_date,
    dft.calibration_date,
    to_char(dft.calibration_date, 'FMMonth dd, yyyy'::text) AS calibration_date_display,
    dft.company_name AS tank_company_name,
    dft.model_number AS tank_model_number,
    dft.serial_number AS tank_serial_number,
    dft.tank_capacity,
    dft.recheck_year,
    dft.create_timestamp AS tank_create_timestamp,
    (SELECT string_agg(to_char(reissue_date, 'FMMon FMDD YYYY'), ', ' ORDER BY reissue_date DESC) FROM mals_app.mal_licence_reissue_date WHERE licence_id = lic.id) AS reissue_dates
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_dairy_farm_tank dft ON site.id = dft.site_id
     JOIN mals_app.mal_status_code_lu sitestat ON site.status_code_id = sitestat.id;

----
-- MALS2-62 - Change to Apiary Site Summary Report
----
-- Add the number of sites with premises ID's to the apiary site summary report
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
            ARRAY_AGG(apv.apiary_site_id) AS site_ids,
            COUNT(apv.site_premises_id) AS sites_with_premises_id
        FROM 
            mal_apiary_producer_vw apv
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
                    'SiteIDs',      site_ids,
                    'SitesWithPremisesId', sites_with_premises_id
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

----
-- MALS2-67 - Positive Inhibitor Dairy Infractions
----
-- Add IH RecordedDate value to ih infraction json, was previously using aggregated date
-- mals_app.mal_print_dairy_farm_infraction_vw source

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
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SPC1', 'DairyTestIBC', base.spc1_value, 'CorrespondenceCode', base.spc1_correspondence_code, 'LevyPercent', base.spc1_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.spc1_infraction_flag = true AND base.spc1_correspondence_code IS NOT NULL
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
  WHERE base.scc_infraction_flag = true AND base.scc_correspondence_code IS NOT NULL
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
  WHERE base.cry_infraction_flag = true AND base.cry_correspondence_code IS NOT NULL
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
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'ReportedOnDate', base.reported_on_date, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'IH', 'DairyTestIH', base.ih_value, 'CorrespondenceCode', base.ih_correspondence_code, 'LevyPercent', base.ih_levy_percentage, 'SiteAddress', base.site_address, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date, 'RecordedDate', to_char(base.ih_date::timestamp with time zone, 'fmMonth dd, yyyy'::text))
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.ih_infraction_flag = true AND base.ih_correspondence_code IS NOT NULL;

----
-- MALS2-69 - Enable search by Premises ID
----
-- Add an array of Premises IDs to each licence returned by the licence summary view

CREATE OR REPLACE VIEW mals_app.mal_licence_summary_vw
AS SELECT lic.id AS licence_id,
    lic.licence_type_id,
    lic.status_code_id,
    lic.primary_registrant_id,
    lic.region_id,
    lic.regional_district_id,
    lic.plant_code_id,
    lic.species_code_id,
    lic.licence_number,
    lic.irma_number,
    lictyp.licence_type,
    reg.last_name,
    reg.first_name,
    lic.company_name,
    lic.primary_phone,
    lic.secondary_phone,
    lic.fax_number,
    reg.email_address,
    stat.code_description AS licence_status,
    lic.application_date,
    lic.issue_date,
    lic.expiry_date,
    lic.reissue_date,
    lic.fee_collected,
    lic.bond_continuation_expiry_date,
    rgn.region_name,
    dist.district_name,
    lic.address_line_1,
    lic.address_line_2,
    lic.city,
    lic.province,
    lic.postal_code,
    lic.country,
    lic.mail_address_line_1,
    lic.mail_address_line_2,
    lic.mail_city,
    lic.mail_province,
    lic.mail_postal_code,
    lic.mail_country,
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
    sp.code_name AS licence_species_code,
    lic.action_required,
    lic.print_certificate,
    lic.print_renewal,
    lic.print_dairy_infraction,
	COALESCE(
    (
        SELECT array_agg(DISTINCT clean_pid ORDER BY clean_pid)
        FROM (
            SELECT NULLIF(BTRIM(site.premises_id::text), '') AS clean_pid
            FROM mals_app.mal_site site
            WHERE site.licence_id = lic.id
        ) cleaned
        WHERE clean_pid IS NOT NULL
    ),
    ARRAY[]::varchar[]
	) AS premises_ids
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu stat ON lic.status_code_id = stat.id
     LEFT JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     LEFT JOIN mals_app.mal_region_lu rgn ON lic.region_id = rgn.id
     LEFT JOIN mals_app.mal_regional_district_lu dist ON lic.regional_district_id = dist.id
     LEFT JOIN mals_app.mal_licence_species_code_lu sp ON lic.species_code_id = sp.id;

----
-- MALS2-68/70 - Display the Premises ID field in the registrant's sites list / search results
----
-- Add site premises id value to the site search view

CREATE OR REPLACE VIEW mals_app.mal_site_detail_vw
AS SELECT site.id AS site_id_pk,
    lic.id AS licence_id,
    site.status_code_id AS site_status_id,
    sitestat.code_name AS site_status,
    lic.status_code_id AS licence_status_id,
    licstat.code_name AS licence_status,
    lic.licence_type_id,
    lictyp.licence_type,
    lic.licence_number,
    lic.irma_number AS licence_irma_number,
    site.apiary_site_id,
        CASE lictyp.licence_type
            WHEN 'APIARY'::text THEN concat(lic.licence_number, '-', site.apiary_site_id)
            ELSE NULL::text
        END AS apiary_site_id_display,
    site.contact_name AS site_contact_name,
    site.address_line_1 AS site_address_line_1,
    reg.first_name AS registrant_first_name,
    reg.last_name AS registrant_last_name,
    NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text) AS registrant_first_last,
        CASE
            WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
            ELSE COALESCE(reg.last_name, reg.first_name)
        END AS registrant_last_first,
    lic.company_name,
    reg.primary_phone AS registrant_primary_phone,
    reg.email_address AS registrant_email_address,
    lic.city AS licence_city,
    r.region_number AS licence_region_number,
    r.region_name AS licence_region_name,
    rd.district_number AS licence_regional_district_number,
    rd.district_name AS licence_regional_district_name,
    site.premises_id as premises_id
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_status_code_lu sitestat ON site.status_code_id = sitestat.id
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     LEFT JOIN mals_app.mal_region_lu r ON site.region_id = r.id
     LEFT JOIN mals_app.mal_regional_district_lu rd ON site.regional_district_id = rd.id;