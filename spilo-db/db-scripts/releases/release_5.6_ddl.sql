-- MALS2-35 - apiary site summary report procedure
-- DROP PROCEDURE mals_app.pr_generate_print_json_apiary_site_summary(in varchar, inout int4);

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
