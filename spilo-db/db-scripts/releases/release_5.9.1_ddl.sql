----
-- MALS2-123 - Dairy Farm inspection date / re-check date and Dairy Farm Inspection Recheck report
----

-- Add inspection and re-check dates to the licence. The application defaults
-- recheck_date to inspection_date + 2 years, but it can be overridden by the user.
ALTER TABLE mals_app.mal_licence ADD COLUMN inspection_date date;
ALTER TABLE mals_app.mal_licence ADD COLUMN recheck_date date;

-- Report: active Dairy Farm licences whose re-check date falls in the requested year
-- DROP PROCEDURE mals_app.pr_generate_print_json_dairy_farm_inspection_recheck(in int4, inout int4);

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_inspection_recheck(IN ip_recheck_year integer, INOUT iop_print_job_id integer)
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
	with licence_details as (
		select
			json_agg(json_build_object('IRMA_Num',                lic.irma_number,
									   'LicenceHolderCompany',    coalesce(lic.company_name, nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')),
									   'RecheckYear',             to_char(lic.recheck_date, 'yyyy'),
									   'LastInspectionDate',      to_char(lic.inspection_date, 'fmMonth dd, yyyy'),
									   'FarmAddress',             nullif(concat_ws(', ',
																		nullif(trim(lic.address_line_1), ''),
																		nullif(trim(lic.address_line_2), ''),
																		nullif(trim(lic.city), ''),
																		nullif(trim(lic.province), ''),
																		nullif(trim(lic.postal_code), '')), ''))
					 order by lic.irma_number) licence_json,
			count(*) num_licences
		from mal_licence lic
		inner join mal_licence_type_lu lictyp
		on lic.licence_type_id = lictyp.id
		inner join mal_status_code_lu stat
		on lic.status_code_id = stat.id
		left join mal_registrant reg
		on lic.primary_registrant_id = reg.id
		where lictyp.licence_type = 'DAIRY FARM'
		and stat.code_name = 'ACT'
		and lic.recheck_date >= make_date(ip_recheck_year, 1, 1)
		and lic.recheck_date < make_date(ip_recheck_year + 1, 1, 1))
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
		'DAIRY_FARM_INSPECTION_RECHECK',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Type',        'DAIRY FARM',
						  'RecheckYear',         ip_recheck_year::varchar,
						  'Reg',                 licence_json,
						  'Total_Num_Licences',  num_licences) report_json,
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

GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_inspection_recheck(in int4, inout int4) TO mals;
GRANT EXECUTE ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_inspection_recheck(in int4, inout int4) TO mals_app_role;
