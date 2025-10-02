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
