-- MALS2-20 - Dairy Farm Producers report 
CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_producers(INOUT iop_print_job_id integer)
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
	with producer_details as (
		select 
			json_agg(json_build_object('IRMA_NUM',              producer.irma_number,
										'FarmName',             producer.company_name,
										'FarmAddress',  		producer.site_address,
										'PrincipalName',        producer.registrant_last_first,
										'PrincipalFirstLast',   producer.registrant_first_last,
										'PrincipalPhone',       producer.registrant_primary_phone,
										'PrincipalEmail',       producer.registrant_email_address,
										'SiteContactName',      producer.site_contact_name,
										'SiteContactPhone',     producer.site_primary_phone,
										'SiteContactEmail',     producer.site_email)
		                                order by irma_number) producer_json,
			count(licence_number) total_producers
		from mal_dairy_farm_producer_vw producer
		where licence_status='ACT' and site_status='ACT'
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
		'DAIRY_FARM_PRODUCERS',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Total_Producers',     total_producers,
						  'Reg',                 producer_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from producer_details;
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

GRANT SELECT ON mals_app.mal_dairy_farm_producer_vw TO mals_app_role;
