
--       MALS-26 - Revise site details section for Dairy Tank Truck license type
--          Create a table to associate milk trailer trucks with licenses..

--
-- TABLE:  MAL_DAIRY_FARM_TRAILER
--

DROP PROCEDURE IF EXISTS  mals_app.pr_generate_print_json_dairy_farm_trailer_inspection;
DROP VIEW      IF EXISTS  mals_app.mal_dairy_farm_trailer_inspection_vw;
DROP VIEW      IF EXISTS  mals_app.mal_print_dairy_farm_trailer_inspection_vw;
DROP VIEW      IF EXISTS  mals_app.mal_dairy_farm_trailer_vw;
DROP VIEW      IF EXISTS  mals_app.mal_print_dairy_farm_trailer_vw;
DROP TABLE     IF EXISTS  mals_app.mal_dairy_farm_trailer_inspection CASCADE;
DROP TABLE     IF EXISTS  mals_app.mal_dairy_farm_trailer CASCADE;

--
-- TABLE:  MAL_DAIRY_FARM_TRAILER
--

CREATE TABLE mals_app.mal_dairy_farm_trailer (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	status_code_id int4 NOT NULL,
	licence_trailer_seq int4 NULL,
	date_issued timestamp NULL,
	trailer_number varchar(50) NULL,
	geographical_division varchar(50) NULL,
	serial_number_vin varchar(50) NULL,
	license_plate varchar(10) NULL,
	trailer_year smallint NULL,
	trailer_make varchar(50) NULL,
	trailer_type varchar(50) NULL,
	trailer_capacity int4 NULL,
	trailer_compartments smallint NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_trailer_pkey PRIMARY KEY (id),
	CONSTRAINT mal_dairy_farm_trailer_ukey UNIQUE (licence_id, licence_trailer_seq),
	CONSTRAINT dftr_licence_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT dftr_status_code_id_fk FOREIGN KEY (status_code_id) REFERENCES mals_app.mal_status_code_lu(id)
);
	
-- Table Triggers

CREATE TRIGGER mal_trg_dairy_farm_trailer_biu before
INSERT OR UPDATE ON mals_app.mal_dairy_farm_trailer
	FOR EACH ROW EXECUTE FUNCTION mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_trailer OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_trailer TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_trailer TO mals_app_role;

--
-- VIEW:  MAL_DAIRY_FARM_TRAILER_VW
--

CREATE VIEW mals_app.mal_dairy_farm_trailer_vw
AS
	SELECT trlr.id AS dairy_farm_trailer_id,
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
	    trlrstat.code_name AS trailer_status,
	    trlr.licence_trailer_seq,
		trlr.trailer_number,
		trlr.geographical_division,
		trlr.serial_number_vin,
		trlr.license_plate,
		trlr.trailer_year,
		trlr.trailer_make,
		trlr.trailer_type,
		trlr.trailer_capacity,
		trlr.trailer_compartments
	   FROM mal_licence lic
	     INNER JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
	     INNER JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
	     INNER JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
	     INNER JOIN mal_dairy_farm_trailer trlr ON lic.id = trlr.licence_id
	     INNER JOIN mals_app.mal_status_code_lu trlrstat ON trlr.status_code_id = trlrstat.id;

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_trailer_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_trailer_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_dairy_farm_trailer_vw TO mals_app_role;

--
-- VIEW:  MAL_PRINT_DAIRY_FARM_TRAILER_VW
--

CREATE OR REPLACE VIEW mals_app.mal_print_dairy_farm_trailer_vw
AS WITH subq AS (
         SELECT lictyp.licence_type,
            lic.id AS licence_id,
            lic.licence_number,
            lic.irma_number,
	    	licstat.code_name AS licence_status,
            reg.last_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS company_name,
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
            END AS derived_mailing_postal_code
           FROM mal_dairy_farm_trailer trlr
             INNER JOIN mal_licence lic ON trlr.licence_id = lic.id
             INNER JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             INNER JOIN mal_registrant reg ON lic.primary_registrant_id = reg.id
             INNER JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
        )
 SELECT subq.licence_type,
    subq.licence_id,
    subq.licence_number,
    subq.irma_number,
    subq.last_name, 
    json_build_object(
    	'CurrentDate', to_char(CURRENT_DATE::timestamp with time zone, 'fmMonth dd, yyyy'::text), 
    	'IRMA_Num', subq.irma_number, 
    	'LicenceStatus', subq.licence_status,
    	'LicenceHolderCompany', subq.company_name, 
    	'MailingAddress', subq.derived_mailing_address, 
    	'MailingCity', subq.derived_mailing_city, 
    	'MailingProv', subq.derived_mailing_province, 
    	'PostCode', subq.derived_mailing_postal_code,
	    'LicenceTrailerID', trlr.licence_trailer_seq,
		'TrailerNumber', trlr.trailer_number,
    	'TrailerStatus', trlrstat.code_name,
		'CompanyDivision', trlr.geographical_division,
		'SerialNumberVin', trlr.serial_number_vin,
		'LicencePlate', trlr.license_plate,
		'TrailerYear', trlr.trailer_year,
		'TrailerMake', trlr.trailer_make,
		'TrailerType', trlr.trailer_type,
		'TrailerCapacity', trlr.trailer_capacity,
		'TrailerCompartments', trlr.trailer_compartments
    	) AS json_payload
   FROM subq 
  	 INNER JOIN mal_dairy_farm_trailer trlr ON subq.licence_id = trlr.licence_id
	 INNER JOIN mals_app.mal_status_code_lu trlrstat ON trlr.status_code_id = trlrstat.id;

-- Permissions

ALTER TABLE mals_app.mal_print_dairy_farm_trailer_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_dairy_farm_trailer_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_dairy_farm_trailer_vw TO mals_app_role;

--
-- TABLE:  MAL_DAIRY_FARM_TRAILER_INSPECTION
--

CREATE TABLE mals_app.mal_dairy_farm_trailer_inspection (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	trailer_id int4 NOT NULL,
	inspection_date timestamp NULL,
	inspector_id  varchar(128) NULL,
	inspection_comments varchar(4000),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_trailer_inspection_pkey PRIMARY KEY (id),
	CONSTRAINT dftri_trailer_fk FOREIGN KEY (trailer_id) REFERENCES mals_app.mal_dairy_farm_trailer(id)

);
	
-- Table Triggers

CREATE TRIGGER mal_trg_dairy_farm_trailer_inspection_biu before
INSERT OR UPDATE ON mals_app.mal_dairy_farm_trailer_inspection 
  FOR EACH ROW EXECUTE FUNCTION mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_trailer_inspection OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_trailer_inspection TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_trailer_inspection TO mals_app_role;

--
-- VIEW:  MAL_DAIRY_FARM_TRAILER_INSPECTION_VW
--

CREATE VIEW mals_app.mal_dairy_farm_trailer_inspection_vw
AS
	SELECT insp.id AS dairy_farm_trailer_inspection_id,
	    trlr.id AS dairy_farm_trailer_id,
	    lic.id AS licence_id,
	    lic.licence_number,
	    lic.irma_number,
	    lictyp.licence_type,
	    licstat.code_name AS licence_status,
	    lic.company_name,
	    trlr.licence_trailer_seq,
		trlr.trailer_number,
	    trlrstat.code_name AS trailer_status,
		trlr.geographical_division,
		trlr.serial_number_vin,
		trlr.license_plate,
		trlr.trailer_year,
		trlr.trailer_make,
		trlr.trailer_type,
		trlr.trailer_capacity,
		trlr.trailer_compartments,
		insp.inspection_date,
		insp.inspector_id,
		insp.inspection_comments
	   FROM mal_licence lic
	     INNER JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
	     INNER JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
	     INNER JOIN mal_dairy_farm_trailer trlr ON lic.id = trlr.licence_id
	     INNER JOIN mals_app.mal_status_code_lu trlrstat ON trlr.status_code_id = trlrstat.id
	     INNER JOIN mal_dairy_farm_trailer_inspection insp ON trlr.id = insp.trailer_id;

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_trailer_inspection_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_trailer_inspection_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_dairy_farm_trailer_inspection_vw TO mals_app_role;

--
-- VIEW:  MAL_PRINT_DAIRY_FARM_TRAILER_INSPECTION_VW
--

CREATE OR REPLACE VIEW mals_app.mal_print_dairy_farm_trailer_inspection_vw
AS 
 SELECT lictyp.licence_type,
    to_char(insp.inspection_date, 'yyyy') inspection_year,
    lic.id licence_id,
    lic.licence_number,
    lic.irma_number,
    json_build_object(
    	'CurrentDate', to_char(CURRENT_DATE::timestamp with time zone, 'fmMonth dd, yyyy'::text), 
    	'LicenceNumber', lic.licence_number,
    	'IRMA_Num', lic.irma_number, 
    	'LicenceStatus', licstat.code_name,
    	'LicenceHolderCompany', lic.company_name, 
    	'LicenceTrailerSeq', trlr.licence_trailer_seq,
    	'LicenceTrailerID', lic.licence_number || '-' ||trlr.licence_trailer_seq,
		'TrailerNumber', trlr.trailer_number,
    	'TrailerStatus', trlrstat.code_name,
		'CompanyDivision', trlr.geographical_division,
		'SerialNumberVin', trlr.serial_number_vin,
		'LicencePlate', trlr.license_plate,
		'TrailerYear', trlr.trailer_year,
		'TrailerMake', trlr.trailer_make,
		'TrailerType', trlr.trailer_type,
		'TrailerCapacity', trlr.trailer_capacity,
		'TrailerCompartments', trlr.trailer_compartments,
		'InspectionDate', insp.inspection_date,
		'InspectorID', insp.inspector_id,
		'InspectionComments', insp.inspection_comments
    	) AS json_payload
	   FROM mal_licence lic
	     INNER JOIN mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
	     INNER JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
	     INNER JOIN mal_dairy_farm_trailer trlr ON lic.id = trlr.licence_id
	     INNER JOIN mal_dairy_farm_trailer_inspection insp ON trlr.id = insp.trailer_id
	     INNER JOIN mals_app.mal_status_code_lu trlrstat ON trlr.status_code_id = trlrstat.id;

-- Permissions

ALTER TABLE mals_app.mal_print_dairy_farm_trailer_inspection_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_dairy_farm_trailer_inspection_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_dairy_farm_trailer_inspection_vw TO mals_app_role;

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
            to_char(s.registration_date, 'yyyy/mm/dd'::text) AS registration_date,
            s.legal_description,
            s.site_details,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mal_licence l
             JOIN mal_site s ON l.id = s.licence_id
             JOIN mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mal_status_code_lu stat ON s.status_code_id = stat.id
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
             JOIN mal_dairy_farm_tank t ON ast.site_id = t.site_id
          GROUP BY ast.licence_id
        ), dairy_trailer AS (
         SELECT lic.licence_id,
            json_agg(json_build_object(
						'TrailerID', lic.licence_number || '-' || trlr.licence_trailer_seq,
					    'TrailerNumber', trlr.trailer_number,
					    'GeographicalDivision', trlr.geographical_division,
					    'SerialNumberVIN', trlr.serial_number_vin,
					    'LicencePlate', trlr.license_plate,
					    'TrailerYear', trlr.trailer_year,
					    'TrailerMake', trlr.trailer_make,
					    'TrailerType', trlr.trailer_type,
					    'TrailerCapacity', trlr.trailer_capacity,    
					    'TrailerCompartments', trlr.trailer_compartments)) AS trailer_json
            FROM licence_base lic
             JOIN mal_dairy_farm_trailer trlr ON lic.licence_id = trlr.licence_id
          GROUP BY lic.licence_id
        )
 SELECT base.licence_type,
    base.licence_number,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'TotalColonies', base.total_hives, 'ApiarySites', apiary.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'DAIRY FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ReIssueDate', base.reissue_date_display, 'SiteDetails', site.full_address, 'SiteInformation', tank.tank_json, 'IRMA_Num', base.irma_number)
            WHEN 'DAIRY TANK TRUCK' THEN            
				    json_build_object(
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
						'Phone', base.registrant_primary_phone_display, 
						'Email', base.email_address, 
						'LicencedTrailers', trailer.trailer_json)
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

-- Permissions

ALTER TABLE mals_app.mal_print_certificate_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_certificate_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_certificate_vw TO mals_app_role;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_TRAILER_INSPECTION
--

CREATE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_trailer_inspection(
	IN ip_licence_number   integer, 
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
	WITH trasiler_inspections as (
		 SELECT irma_number,
		    licence_number,
		    company_name,
		    json_agg(json_build_object(
						'TrailerID', licence_number || '-' || licence_trailer_seq,
					    'TrailerNumber', trailer_number,
					    'GeographicalDivision', geographical_division,
					    'SerialNumberVIN', serial_number_vin,
					    'LicencePlate', license_plate,
					    'Trailer', trailer_year,
					    'TrailerMake', trailer_make,
					    'TrailerType', trailer_type,
					    'TrailerCapacity', trailer_capacity,    
					    'TrailerCompartments', trailer_compartments,
					    'InspectionDate', inspection_date,
					    'InspectionYear', extract(year from inspection_date),
					    'InspectorName', inspector_id,
					    'InspectionComments', inspection_comments)) AS trailer_json
		    FROM mal_dairy_farm_trailer_inspection_vw
		    WHERE licence_number = ip_licence_number
		  GROUP BY irma_number,
		    licence_number,
		    company_name)
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
		'DAIRY TANK TRUCK',
		null,
		'TRAILER INSPECTION',
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'IrmaNumber',         irma_number,
						  'LicenceNumber',      licence_number,
						  'CompanyName',        company_name,
						  'TrailerInspections', trailer_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from trasiler_inspections;
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

ALTER PROCEDURE mals_app.pr_generate_print_json_dairy_farm_trailer_inspection(in varchar, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_trailer_inspection(in varchar, inout int4) TO mals;
GRANT EXECUTE ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_trailer_inspection(in varchar, inout int4) TO mals_app_role;
