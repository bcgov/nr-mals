
SET search_path TO mals_app;

/*
 	On Patroni pods,
 
	Generate ALTER SEQUENCE statements, on the patroni pods, to update the next value, and save to file
		select 'alter sequence ' || schemaname || '.' || sequencename || ' restart with ' || coalesce(last_value,0) + 1 || ';' str
		from pg_sequences 
		order by 1;
*/

--
-- Populate this file with the output of the above statement
--

alter sequence mals_app.mal_add_reason_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_apiary_inspection_id_seq restart with 70201;
alter sequence mals_app.mal_application_role_id_seq restart with 34;
alter sequence mals_app.mal_application_user_id_seq restart with 74;
alter sequence mals_app.mal_city_lu_id_seq restart with 61683;
alter sequence mals_app.mal_dairy_farm_species_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_dairy_farm_species_sub_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_dairy_farm_tank_id_seq restart with 61514;
alter sequence mals_app.mal_dairy_farm_test_infraction_lu_id_seq restart with 60033;
alter sequence mals_app.mal_dairy_farm_test_job_id_seq restart with 117;
alter sequence mals_app.mal_dairy_farm_test_result_id_seq restart with 150108;
alter sequence mals_app.mal_dairy_farm_test_threshold_lu_id_seq restart with 1;  -- Manually changed to 6 post deployment, as 1 thru 5 exists
alter sequence mals_app.mal_delete_reason_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_fur_farm_inventory_id_seq restart with 60076;
alter sequence mals_app.mal_game_farm_inventory_id_seq restart with 60388;
alter sequence mals_app.mal_licence_comment_id_seq restart with 62107;
alter sequence mals_app.mal_licence_id_seq restart with 60978;
alter sequence mals_app.mal_licence_licence_number_seq restart with 60978;
alter sequence mals_app.mal_licence_parent_child_xref_id_seq restart with 61150;
alter sequence mals_app.mal_licence_registrant_xref_id_seq restart with 73516;
alter sequence mals_app.mal_licence_species_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_licence_species_sub_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_licence_type_lu_id_seq restart with 1;               -- Manually changed to 134 post deployment, as 100 thru 133 exists
alter sequence mals_app.mal_licence_type_parent_child_xref_id_seq restart with 60033;
alter sequence mals_app.mal_plant_code_lu_id_seq restart with 60066;
alter sequence mals_app.mal_premises_detail_id_seq restart with 784;
alter sequence mals_app.mal_premises_job_id_seq restart with 132;
alter sequence mals_app.mal_print_job_id_seq restart with 1198;
alter sequence mals_app.mal_print_job_output_id_seq restart with 7687;
alter sequence mals_app.mal_print_job_print_job_number_seq restart with 1198;
alter sequence mals_app.mal_region_lu_id_seq restart with 60033;
alter sequence mals_app.mal_regional_district_lu_id_seq restart with 60033;
alter sequence mals_app.mal_registrant_id_seq restart with 60984;
alter sequence mals_app.mal_sale_yard_inventory_id_seq restart with 65247;
alter sequence mals_app.mal_sale_yard_species_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_sale_yard_species_sub_code_lu_id_seq restart with 60033;
alter sequence mals_app.mal_site_id_seq restart with 61583;
alter sequence mals_app.mal_status_code_lu_id_seq restart with 60034;
