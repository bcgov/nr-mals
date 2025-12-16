--       MALS-17 - New report - to show comments by license number and or IRMA number
--          Create a view and procedure to support Comments reporting.

DROP PROCEDURE IF EXISTS  mals_app.pr_generate_print_json_licence_comments;
DROP VIEW      IF EXISTS  mals_app.mal_licence_comment_vw;

--
-- VIEW:  MAL_LICENCE_COMMENT_VW
--

CREATE OR REPLACE VIEW mals_app.mal_licence_comment_vw
AS SELECT lic.id AS licence_id,
    lic.licence_number,
    lic.irma_number,
    reg.last_name,
    reg.first_name,
    lic.company_name,
    reg.email_address,
    lictyp.licence_type,
    com.create_timestamp,
    com.licence_comment
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     LEFT JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     LEFT JOIN mals_app.mal_licence_comment com ON lic.id = com.licence_id;

-- Permissions

ALTER TABLE mals_app.mal_licence_comment_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_comment_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_licence_comment_vw TO mals_app_role;

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_LICENCE_COMMENTS
--

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_licence_comments(IN ip_licence_number character varying, INOUT iop_print_job_id integer)
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
	with licence_comments as (
		select 
			lic.licence_number,
			lic.licence_type,
			json_agg(json_build_object('LicenceNumber',               lic.licence_number,
				                       'Lastname',                    lic.last_name,
				                       'Firstname',                   lic.first_name,
				                       'Company',  					  lic.company_name,                     
				                       'Email',                       lic.email_address,	
				                       'LicenceType',                 lic.licence_type,
				                       'CommentDate',                 lic.create_timestamp,
				                       'Comment',                 	  lic.licence_comment)
				                       order by lic.create_timestamp) licence_json,
			count(*) num_rows
		from mal_licence_comment_vw lic
		WHERE (lic.irma_number = ip_licence_number) OR (CAST(lic.licence_number AS varchar) = ip_licence_number)
		group by lic.licence_number, lic.licence_type
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
		licence_type,
		null,
		'LICENCE_COMMENTS',
		json_build_object('DateTime',       to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Number',   licence_number,
						  'Licence',        licence_json,
						  'RowCount',       num_rows) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_comments;
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

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_licence_comments(in varchar, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_comments(in varchar, inout int4) TO mals;
GRANT EXECUTE ON PROCEDURE mals_app.pr_generate_print_json_licence_comments(in varchar, inout int4) TO mals_app_role;

--       MALS-19 - Add a column to the Dairy Test Threshold Report
--          Add the Penaltiesd Issued column to the licence_json JSON object.

--
-- PROCEDURE:  PR_GENERATE_PRINT_JSON_DAIRY_FARM_TEST_THRESHOLD
--

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_test_threshold(ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
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
	with result_base as (
		select lic.id licence_id,
			rslt.irma_number,			
		    coalesce(lic.company_name, nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')) derived_licence_holder_name,
		    coalesce(spc1_date, scc_date, cry_date, ffa_date, ih_date) derived_test_date,
		    rslt.spc1_infraction_flag,
		    case when rslt.spc1_infraction_flag then rslt.spc1_value else null end spc1_value,
		    case when rslt.spc1_infraction_flag then rslt.spc1_correspondence_code else null end spc1_corespondence_code,
		    case when rslt.spc1_infraction_flag then rslt.spc1_levy_percentage else null end spc1_levy_percentage,
		    case when rslt.spc1_infraction_flag then 
		    	case when rslt.spc1_correspondence_code = 'W' then 'Warning' else concat(rslt.spc1_levy_percentage, '%') end
		    	else null end spc1_penalty_issued,
		    rslt.scc_infraction_flag,
		    case when rslt.scc_infraction_flag then rslt.scc_value else null end scc_value,
		    case when rslt.scc_infraction_flag then rslt.scc_correspondence_code else null end scc_corespondence_code,
		    case when rslt.scc_infraction_flag then rslt.scc_levy_percentage else null end scc_levy_percentage,
		    case when rslt.scc_infraction_flag then 
		    	case when rslt.scc_correspondence_code = 'W' then 'Warning' else concat(rslt.scc_levy_percentage, '%') end
		    	else null end  scc_penalty_issued,
		    rslt.cry_infraction_flag,
		    case when rslt.cry_infraction_flag then rslt.cry_value else null end cry_value,
		    case when rslt.cry_infraction_flag then rslt.cry_correspondence_code else null end cry_corespondence_code,
		    case when rslt.cry_infraction_flag then rslt.cry_levy_percentage else null end cry_levy_percentage,
		    case when rslt.cry_infraction_flag then 
		    	case when rslt.cry_correspondence_code = 'W' then 'Warning' else concat(rslt.cry_levy_percentage, '%') end
		    	else null end cry_penalty_issued,
		    rslt.ffa_infraction_flag,
		    case when rslt.ffa_infraction_flag then rslt.ffa_value else null end ffa_value,
		    rslt.ih_infraction_flag,
		    case when rslt.ih_infraction_flag then rslt.ih_value else null end ih_value,
		    case when rslt.ih_infraction_flag then rslt.ih_correspondence_code else null end ih_corespondence_code,
		    case when rslt.ih_infraction_flag then rslt.ih_levy_percentage else null end ih_levy_percentage,
		    case when rslt.ih_infraction_flag then 
		    	case when rslt.ih_correspondence_code = 'W' then 'Warning' else concat(rslt.ih_levy_percentage, '%') end
		    	else null end ih_penalty_issued,
			case when spc1_infraction_flag then 1 else 0 end +
				case when scc_infraction_flag then 1 else 0 end +
		 		case when cry_infraction_flag then 1 else 0 end +
		 		case when ih_infraction_flag then 1 else 0 end num_infractions
		from mal_licence lic
		inner join mal_registrant reg
		on lic.primary_registrant_id = reg.id
		inner join mal_dairy_farm_test_result rslt
		on lic.id = rslt.licence_id
		where greatest(spc1_date, scc_date, cry_date, ffa_date, ih_date) 
				 between ip_start_date and ip_end_date
		and greatest(spc1_infraction_flag, scc_infraction_flag, cry_infraction_flag, ffa_infraction_flag, ih_infraction_flag) = true
		),
	infractions as (
		select licence_id,
			rtrim(concat(
				case when num_infractions > 1 then spc1_penalty_issued || ' SPC1, ' else spc1_penalty_issued end, 
				case when num_infractions > 1 then scc_penalty_issued || ' SCC, ' else scc_penalty_issued end, 
				case when num_infractions > 1 then cry_penalty_issued || ' CRY, ' else cry_penalty_issued end, 
				case when num_infractions > 1 then ih_penalty_issued  || ' IH, 'else ih_penalty_issued end), ', ') penalties_issued
		from result_base),
	licence_list as (
		select json_agg(json_build_object('IRMA_Num',               rb.irma_number,
										  'LicenceHolderCompany',   rb.derived_licence_holder_name,
										  'TestDate',               rb.derived_test_date,
										  'IBC_Result',             rb.spc1_value,
										  'SCC_Result',             rb.scc_value,
										  'CRY_Result',             rb.cry_value,
										  'FFA_Result',             rb.ffa_value,
										  'IH_Result',              rb.ih_value,
										  'PenaltyIssued',          inf.penalties_issued)
						order by irma_number) licence_json
		from result_base rb
		left join infractions inf
		on rb.licence_id = inf.licence_id),
	result_summary as (
		select 
			count(spc1_value) spc1_count,
			count(scc_value) scc_count,
			count(cry_value) cry_count,
			count(ffa_value) ffa_count,
			count(ih_value) ih_count
		from result_base)
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
		'DAIRY_TEST_THRESHOLD',
		json_build_object('DateTime',          to_char(current_timestamp, 'fmyyyy-mm-dd hh24:mi'),
						  'DateRangeStart',    to_char(ip_start_date, 'fmMonth dd, yyyy'),
						  'DateRangeEnd',      to_char(ip_end_date, 'fmMonth dd, yyyy'),
						  'Reg',               list.licence_json,
						  'Tot_IBC_Count',     smry.spc1_count,
						  'Tot_SCC_Count',     smry.scc_count,
						  'Tot_CRY_Count',     smry.cry_count,
						  'Tot_FFA_Count',     smry.ffa_count,
						  'Tot_IH_Count',      smry.ih_count) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_list list
	cross join result_summary smry;
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

--       MALS-24 - Purchase Live Poultry License - Act & Reg wording needs updating
--          Update the legislation column to reflec the new terminology.

UPDATE mals_app.mal_licence_type_lu
SET legislation = 'Under the authority of the Animal Health Act and s.9(2) of the Poultry Health and Buying Regulation'
WHERE licence_type = 'PURCHASE LIVE POULTRY';