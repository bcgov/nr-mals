----
-- MALS2-122 - Revision to Dairy Client Details Report: add site contact
----
-- The Dairy Client Details report only showed the registrant's contact info.
-- Add the site contact (often the herdsman / farm manager) from the Site
-- Contact Details section: contact name, primary phone, secondary phone, email.
-- Requires the updated Dairy_Client_Details_Template.xlsx (SiteContactName,
-- SitePhone, SiteSecondaryPhone, SiteEmail).

-- New columns are appended at the end so CREATE OR REPLACE VIEW is allowed.
-- mals_app.mal_dairy_farm_tank_vw source
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
    (SELECT string_agg(to_char(reissue_date, 'FMMon FMDD YYYY'), ', ' ORDER BY reissue_date DESC) FROM mals_app.mal_licence_reissue_date WHERE licence_id = lic.id) AS reissue_dates,
    site.contact_name AS site_contact_name,
    site.primary_phone AS site_primary_phone,
    site.secondary_phone AS site_secondary_phone,
    site.email_address AS site_email_address
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_dairy_farm_tank dft ON site.id = dft.site_id
     JOIN mals_app.mal_status_code_lu sitestat ON site.status_code_id = sitestat.id;

-- Add the site contact values to the dairy farm details report json
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
										'ReissueDates',          tank.reissue_dates,
										'SiteContactName',       tank.site_contact_name,
										'SitePhone',             tank.site_primary_phone,
										'SiteSecondaryPhone',    tank.site_secondary_phone,
										'SiteEmail',             tank.site_email_address)
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
