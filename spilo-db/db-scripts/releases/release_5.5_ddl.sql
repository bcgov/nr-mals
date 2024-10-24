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