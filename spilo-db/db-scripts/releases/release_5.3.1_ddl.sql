--
--    MALS-1248 - Dairy Test Result - IH Correspondence
--        Move the functionality from the view and into the stored procedure.
--        This approach should improve performance and make it easier to support.
--        The view pr_update_dairy_farm_test_results can be dropped
--
--
-- VIEW:  MAL_DAIRY_FARM_TEST_INFRACTION_VW
--
	alter view mal_dairy_farm_test_infraction_vw rename to arch_mal_dairy_farm_test_infraction_vw;
--
--
-- DATA:  MAL_DAIRY_FARM_TEST_INFRACTION_LU
--
	--  The FFA Sub Species does not produce Infraction Correspondence.
	delete from mal_dairy_farm_test_infraction_lu
	where test_threshold_id = (
		select id
		from mal_dairy_farm_test_threshold_lu
		where species_sub_code = 'FFA');
--
--
-- PROCEDURE:  PR_UPDATE_DAIRY_FARM_TEST_RESULTS
--
CREATE OR REPLACE PROCEDURE pr_update_dairy_farm_test_results(
	IN ip_job_id integer, 
	IN ip_source_row_count integer, 
	INOUT iop_job_status character varying, 
	INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_target_insert_count     integer default 0;
	l_target_update_count  integer default 0;
  begin
		--  ### 
		--  ### Step 1 Updates
		--  ###     Sub Dates
		--  ###     Infraction Flags
		--  ###     Previous Infraction First Dates
		--  ### 
		with 
			report_month as (
				select concat(test_year, '-', test_month, '-01')::date
								+ INTERVAL '1 MONTH - 1 day' last_day_of_month
				from mal_dairy_farm_test_result
				where test_job_id = ip_job_id
				limit 1),
		    threshold_pivot as (
			    -- Pivot the five thresholds into a single row.
				select 
					max(case species_sub_code when 'SPC1' then upper_limit       end) as spc1_upper_limit,
					max(case species_sub_code when 'SPC1' then infraction_window end) as spc1_infraction_window,
					max(case species_sub_code when 'SCC'  then upper_limit       end) as scc_upper_limit,
					max(case species_sub_code when 'SCC'  then infraction_window end) as scc_infraction_window,
					max(case species_sub_code when 'CRY'  then upper_limit       end) as cry_upper_limit,
					max(case species_sub_code when 'CRY'  then infraction_window end) as cry_infraction_window,
					max(case species_sub_code when 'FFA'  then upper_limit       end) as ffa_upper_limit,
					max(case species_sub_code when 'FFA'  then infraction_window end) as ffa_infraction_window,
					max(case species_sub_code when 'IH'   then upper_limit       end) as ih_upper_limit,
					max(case species_sub_code when 'IH'   then infraction_window end) as ih_infraction_window			 
				from mal_dairy_farm_test_threshold_lu
				where species_code = 'FRMQA'
				and active_flag = true)
		--
		--  Main Update
		--
		update  mal_dairy_farm_test_result tgt 
			set spc1_date                           = src.spc1_date,
				spc1_previous_infraction_first_date = src.spc1_previous_infraction_first_date,
				spc1_infraction_flag                = src.spc1_infraction_flag,
				scc_date                            = src.scc_date,
				scc_previous_infraction_first_date  = src.scc_previous_infraction_first_date,
				scc_infraction_flag                 = src.scc_infraction_flag,
				cry_date                            = src.cry_date,
				cry_previous_infraction_first_date  = src.cry_previous_infraction_first_date,
				cry_infraction_flag                 = src.cry_infraction_flag,
				ffa_date                            = src.ffa_date,
				ffa_previous_infraction_first_date  = src.ffa_previous_infraction_first_date,
				ffa_infraction_flag                 = src.ffa_infraction_flag,
				ih_date                             = src.ih_date,
				ih_previous_infraction_first_date   = src.ih_previous_infraction_first_date,
				ih_infraction_flag                  = src.ih_infraction_flag
		from (
				-- join the results to the infraction limits. Calculate the Infractions.
				select 
				 	results.id as test_result_id,
	                CASE
	                    WHEN results.spc1_day IS NULL OR results.spc1_day = '' THEN NULL
	                    ELSE concat(results.test_year, '-', results.test_month, '-', results.spc1_day)::date
	                END AS spc1_date,
				    (rpt.last_day_of_month - thr_pvt.spc1_infraction_window::interval + '1 day'::interval)::date as spc1_previous_infraction_first_date,
				    case when results.spc1_value > thr_pvt.spc1_upper_limit then true else false end as spc1_infraction_flag,
	                CASE
	                    WHEN results.scc_day IS NULL OR results.scc_day = '' THEN NULL
	                    ELSE concat(results.test_year, '-', results.test_month, '-', results.scc_day)::date
	                END AS scc_date,
				    (rpt.last_day_of_month - thr_pvt.scc_infraction_window::interval + '1 day'::interval)::date as scc_previous_infraction_first_date,
				    case when results.scc_value > thr_pvt.scc_upper_limit then true else false end as scc_infraction_flag,
	                CASE
	                    WHEN results.cry_day IS NULL OR results.cry_day = '' THEN NULL
	                    ELSE concat(results.test_year, '-', results.test_month, '-', results.cry_day)::date
	                END AS cry_date,
				    (rpt.last_day_of_month - thr_pvt.cry_infraction_window::interval + '1 day'::interval)::date as cry_previous_infraction_first_date,
				    case when results.cry_value > thr_pvt.cry_upper_limit then true else false end as cry_infraction_flag,
	                CASE
	                    WHEN results.ffa_day IS NULL OR results.ffa_day = '' THEN NULL
	                    ELSE concat(results.test_year, '-', results.test_month, '-', results.ffa_day)::date
	                END AS ffa_date,
				    (rpt.last_day_of_month - thr_pvt.ffa_infraction_window::interval + '1 day'::interval)::date as ffa_previous_infraction_first_date,
				    case when results.ffa_value > thr_pvt.ffa_upper_limit then true else false end as ffa_infraction_flag,
	                CASE
	                    WHEN results.ih_day IS NULL OR results.ih_day = '' THEN NULL
	                    ELSE concat(results.test_year, '-', results.test_month, '-', results.ih_day)::date
	                END AS ih_date,
				    (rpt.last_day_of_month - thr_pvt.ih_infraction_window::interval + '1 day'::interval)::date as ih_previous_infraction_first_date,
				    case when results.ih_value > thr_pvt.ih_upper_limit then true else false end as ih_infraction_flag
				from mal_dairy_farm_test_result results
				-- The report date will be used to populate all dates in the job.
				cross join report_month rpt
				-- The infractions pivoted row will join to each result.
				cross join threshold_pivot thr_pvt
				where results.test_job_id = ip_job_id) src
		where (tgt.id = src.test_result_id);
		--
		GET DIAGNOSTICS l_target_update_count = ROW_COUNT;
		--  ### 
		--  ### Step 2 Updates
		--  ###     Previous Infraction Counts
		--  ### 
		with 
			previous_infractions_window as (
				select 
					min(least(spc1_previous_infraction_first_date,
							  scc_previous_infraction_first_date,
							  cry_previous_infraction_first_date,
							  ffa_previous_infraction_first_date,
							  ih_previous_infraction_first_date)) minimum_date
					from mal_dairy_farm_test_result
					where test_job_id = ip_job_id)
		--
		--  Main Update
		--
		update  mal_dairy_farm_test_result tgt 
			set spc1_previous_infraction_count = src.spc1_previous_infraction_count,
				scc_previous_infraction_count  = src.scc_previous_infraction_count,
				cry_previous_infraction_count  = src.cry_previous_infraction_count,
				ffa_previous_infraction_count  = src.ffa_previous_infraction_count,
				ih_previous_infraction_count   = src.ih_previous_infraction_count
		from (		
				select id test_result_id,			
		        (
			        select count(*) as count
			        from mals_app.mal_dairy_farm_test_result sub
			        where sub.irma_number = results.irma_number
			        and sub.spc1_infraction_flag = true
			        and sub.spc1_date >= results.spc1_previous_infraction_first_date
			        and sub.spc1_date < results.spc1_date
			    ) as spc1_previous_infraction_count,
		        (
			        select count(*) as count
			        from mals_app.mal_dairy_farm_test_result sub
			        where sub.irma_number = results.irma_number
			        and sub.scc_infraction_flag = true
			        and sub.scc_date >= results.scc_previous_infraction_first_date
			        and sub.scc_date < results.scc_date
			    ) as scc_previous_infraction_count,
		        (
			        select count(*) as count
			        from mals_app.mal_dairy_farm_test_result sub
			        where sub.irma_number = results.irma_number
			        and sub.cry_infraction_flag = true
			        and sub.cry_date >= results.cry_previous_infraction_first_date
			        and sub.cry_date < results.cry_date
			    ) as cry_previous_infraction_count,
		        (
			        select count(*) as count
			        from mals_app.mal_dairy_farm_test_result sub
			        where sub.irma_number = results.irma_number
			        and sub.ffa_infraction_flag = true
			        and sub.ffa_date >= results.ffa_previous_infraction_first_date
			        and sub.ffa_date < results.ffa_date
			    ) as ffa_previous_infraction_count,
		        (
			        select count(*) as count
			        from mals_app.mal_dairy_farm_test_result sub
			        where sub.irma_number = results.irma_number
			        and sub.ih_infraction_flag = true
			        and sub.ih_date >= results.ih_previous_infraction_first_date
			        and sub.ih_date < results.ih_date
			    ) as ih_previous_infraction_count
				from mal_dairy_farm_test_result results
				-- Performance: Use the window subquery to restrict the number of historical rows to include
				cross join previous_infractions_window wndw
				where test_job_id = ip_job_id
				and (
						spc1_date >= wndw.minimum_date or
						scc_date  >= wndw.minimum_date or
						cry_date  >= wndw.minimum_date or
						ffa_date  >= wndw.minimum_date or
						ih_date   >= wndw.minimum_date)) src
		where (tgt.id = src.test_result_id);
		--  ### 
		--  ### Step 3 Updates
		--  ###     Levy Percentage
		--  ###     Correspondence Code
		--  ###     Correspondence Description 
		--  ### 
		with 
		    infractions_correspondence as (
				-- match the infractions to the appropriate correspondence, ie levy vs warning.
				select subq.species_code,
				   subq.species_sub_code,
				   subq.upper_limit,
				   subq.infraction_window,
				   subq.previous_infractions_count,
				   subq.levy_percentage,
				   subq.correspondence_code,
				   subq.correspondence_description,
				   case
				       when subq.previous_infractions_count = max(subq.previous_infractions_count) over (partition by subq.species_sub_code) then true
				       else null::boolean
				   end as max_previous_infractions_flag
				 from ( select thr.species_code,
				           thr.species_sub_code,
				           thr.upper_limit,
				           thr.infraction_window,
				           inf.previous_infractions_count,
				           inf.levy_percentage,
				           inf.correspondence_code,
				           inf.correspondence_description
				         from mal_dairy_farm_test_threshold_lu thr
				         join mal_dairy_farm_test_infraction_lu inf 
				         on thr.id = inf.test_threshold_id 
				         and thr.active_flag = true 
				         and inf.active_flag = true) subq
				)
		--
		--  Main Query
		--
		update mal_dairy_farm_test_result tgt
			set 
				spc1_levy_percentage            = src.spc1_levy_percentage,
				spc1_correspondence_code        = src.spc1_correspondence_code,
				spc1_correspondence_description = src.spc1_correspondence_description,
				scc_levy_percentage             = src.scc_levy_percentage,
				scc_correspondence_code         = src.scc_correspondence_code,
				scc_correspondence_description  = src.scc_correspondence_description,
				cry_levy_percentage             = src.cry_levy_percentage,
				cry_correspondence_code         = src.cry_correspondence_code,
				cry_correspondence_description  = src.cry_correspondence_description,
				ffa_levy_percentage             = src.ffa_levy_percentage,
				ffa_correspondence_code         = src.ffa_correspondence_code,
				ffa_correspondence_description  = src.ffa_correspondence_description,
				ih_levy_percentage              = src.ih_levy_percentage,
				ih_correspondence_code          = src.ih_correspondence_code,
				ih_correspondence_description   = src.ih_correspondence_description
		from (		
				select 	
					results.id test_result_id,
				    spc1_inf.levy_percentage             as spc1_levy_percentage,
				    spc1_inf.correspondence_code         as spc1_correspondence_code,
				    spc1_inf.correspondence_description  as spc1_correspondence_description,
				    scc_inf.levy_percentage              as scc_levy_percentage,
				    scc_inf.correspondence_code          as scc_correspondence_code,
				    scc_inf.correspondence_description   as scc_correspondence_description,
				    cry_inf.levy_percentage              as cry_levy_percentage,
				    cry_inf.correspondence_code          as cry_correspondence_code,
				    cry_inf.correspondence_description   as cry_correspondence_description,
				    ffa_inf.levy_percentage              as ffa_levy_percentage,
				    ffa_inf.correspondence_code          as ffa_correspondence_code,
				    ffa_inf.correspondence_description   as ffa_correspondence_description,
				    ih_inf.levy_percentage               as ih_levy_percentage,
				    ih_inf.correspondence_code           as ih_correspondence_code,
				    ih_inf.correspondence_description    as ih_correspondence_description
				from mal_dairy_farm_test_result results
				left join infractions_correspondence spc1_inf 
				on results.spc1_infraction_flag = true 
				and spc1_inf.species_sub_code::text = 'SPC1'::text 
				and (results.spc1_previous_infraction_count = spc1_inf.previous_infractions_count 
				    or results.spc1_previous_infraction_count > spc1_inf.previous_infractions_count 
				    and spc1_inf.max_previous_infractions_flag = true)
				left join infractions_correspondence scc_inf 
				on results.scc_infraction_flag = true 
				and scc_inf.species_sub_code::text = 'SCC'::text 
				and (results.scc_previous_infraction_count = scc_inf.previous_infractions_count 
				    or results.scc_previous_infraction_count > scc_inf.previous_infractions_count 
				    and scc_inf.max_previous_infractions_flag = true)
				left join infractions_correspondence cry_inf 
				on results.cry_infraction_flag = true 
				and cry_inf.species_sub_code::text = 'CRY'::text 
				and (results.cry_previous_infraction_count = cry_inf.previous_infractions_count 
				    or results.cry_previous_infraction_count > cry_inf.previous_infractions_count 
				    and cry_inf.max_previous_infractions_flag = true)
				left join infractions_correspondence ffa_inf 
				on results.ffa_infraction_flag = true 
				and ffa_inf.species_sub_code::text = 'FFA'::text 
				and (results.ffa_previous_infraction_count = ffa_inf.previous_infractions_count 
				    or results.ffa_previous_infraction_count > ffa_inf.previous_infractions_count 
				    and ffa_inf.max_previous_infractions_flag = true)
				left join infractions_correspondence ih_inf 
				on results.ih_infraction_flag = true 
				and ih_inf.species_sub_code::text = 'IH'::text 
				and (results.ih_previous_infraction_count = ih_inf.previous_infractions_count 
				    or results.ih_previous_infraction_count > ih_inf.previous_infractions_count 
				    and ih_inf.max_previous_infractions_flag = true)
				where results.test_job_id = ip_job_id) src
		where tgt.id = src.test_result_id;
	--
	-- Determine the process status.
	select count(licence_id)
	into l_target_insert_count
	from mal_dairy_farm_test_result
	where test_job_id = ip_job_id;
	iop_job_status := case 
                        when ip_source_row_count = l_target_update_count and 
                             ip_source_row_count = l_target_insert_count
                        then 'COMPLETE'
                        else 'WARNING'
                      end;
	iop_process_comments := concat( 'Source count: ', ip_source_row_count,
								   ', Insert count: ',l_target_insert_count,  
                                   ', Update count: ',l_target_update_count);								   
	--
	-- Update the Job table.
	update mal_dairy_farm_test_job 
		set
			job_status              = iop_job_status,
			execution_end_time      = current_timestamp,
			source_row_count        = ip_source_row_count,
			target_insert_count     = l_target_insert_count,
			target_update_count     = l_target_update_count,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
end; 
$procedure$
;
