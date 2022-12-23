
SET search_path TO mals_app;

/*
Query to generate statements

	select 'alter table mals_app.' || table_name || ' alter column id set generated always;'
	from information_schema.tables 
	where table_schema = 'mals_app' 
	and table_type = 'BASE TABLE' 
	order by table_name;

	select distinct 'alter table mals_app.' || event_object_table || ' enable trigger ' || trigger_name || ';'
	from information_schema.triggers 
	where trigger_schema = 'mals_app' ;
*/

--  Alter table statements for Talend tDBRow after all data loads.
--
alter table mals_app.mal_add_reason_code_lu alter column id set generated always;
alter table mals_app.mal_apiary_inspection alter column id set generated always;
alter table mals_app.mal_application_role alter column id set generated always;
alter table mals_app.mal_application_user alter column id set generated always;
alter table mals_app.mal_city_lu alter column id set generated always;
alter table mals_app.mal_dairy_farm_species_code_lu alter column id set generated always;
alter table mals_app.mal_dairy_farm_species_sub_code_lu alter column id set generated always;
alter table mals_app.mal_dairy_farm_tank alter column id set generated always;
alter table mals_app.mal_dairy_farm_test_infraction_lu alter column id set generated always;
alter table mals_app.mal_dairy_farm_test_job alter column id set generated always;
alter table mals_app.mal_dairy_farm_test_result alter column id set generated always;
alter table mals_app.mal_dairy_farm_test_threshold_lu alter column id set generated always;
alter table mals_app.mal_delete_reason_code_lu alter column id set generated always;
alter table mals_app.mal_fur_farm_inventory alter column id set generated always;
alter table mals_app.mal_game_farm_inventory alter column id set generated always;
alter table mals_app.mal_licence alter column id set generated always;
alter table mals_app.mal_licence alter column licence_number set generated always;
alter table mals_app.mal_licence_comment alter column id set generated always;
alter table mals_app.mal_licence_parent_child_xref alter column id set generated always;
alter table mals_app.mal_licence_registrant_xref alter column id set generated always;
alter table mals_app.mal_licence_species_code_lu alter column id set generated always;
alter table mals_app.mal_licence_species_sub_code_lu alter column id set generated always;
alter table mals_app.mal_licence_type_lu alter column id set generated always;
alter table mals_app.mal_licence_type_parent_child_xref alter column id set generated always;
alter table mals_app.mal_plant_code_lu alter column id set generated always;
alter table mals_app.mal_premises_detail alter column id set generated always;
alter table mals_app.mal_premises_job alter column id set generated always;
alter table mals_app.mal_print_job alter column id set generated always;
alter table mals_app.mal_print_job alter column print_job_number set generated always;
alter table mals_app.mal_print_job_output alter column id set generated always;
alter table mals_app.mal_region_lu alter column id set generated always;
alter table mals_app.mal_regional_district_lu alter column id set generated always;
alter table mals_app.mal_registrant alter column id set generated always;
alter table mals_app.mal_sale_yard_inventory alter column id set generated always;
alter table mals_app.mal_sale_yard_species_code_lu alter column id set generated always;
alter table mals_app.mal_sale_yard_species_sub_code_lu alter column id set generated always;
alter table mals_app.mal_site alter column id set generated always;
alter table mals_app.mal_status_code_lu alter column id set generated always;

alter table mals_app.mal_add_reason_code_lu enable trigger mal_trg_add_reason_code_lu_biu;
alter table mals_app.mal_apiary_inspection enable trigger mal_trg_apiary_inspection_biu;
alter table mals_app.mal_application_role enable trigger mal_trg_application_role_biu;
alter table mals_app.mal_application_user enable trigger mal_trg_application_user_biu;
alter table mals_app.mal_city_lu enable trigger mal_trg_city_lu_biu;
alter table mals_app.mal_dairy_farm_species_code_lu enable trigger mal_trg_dairy_farm_species_code_lu_biu;
alter table mals_app.mal_dairy_farm_species_sub_code_lu enable trigger mal_trg_dairy_farm_species_sub_code_lu_biu;
alter table mals_app.mal_dairy_farm_tank enable trigger mal_trg_dairy_farm_tank_biu;
alter table mals_app.mal_dairy_farm_test_infraction_lu enable trigger mal_trg_dairy_farm_test_infraction_lu_biu;
alter table mals_app.mal_dairy_farm_test_job enable trigger mal_trg_dairy_farm_test_job_biu;
alter table mals_app.mal_dairy_farm_test_result enable trigger mal_trg_dairy_farm_test_result_biu;
alter table mals_app.mal_dairy_farm_test_threshold_lu enable trigger mal_trg_dairy_farm_test_threshold_lu_biu;
alter table mals_app.mal_delete_reason_code_lu enable trigger mal_trg_delete_reason_code_lu_biu;
alter table mals_app.mal_fur_farm_inventory enable trigger mal_trg_fur_farm_inventory_biu;
alter table mals_app.mal_game_farm_inventory enable trigger mal_trg_game_farm_inventory_biu;
alter table mals_app.mal_licence enable trigger mal_trg_licence_biu;
alter table mals_app.mal_licence_comment enable trigger mal_trg_licence_comment_biu;
alter table mals_app.mal_licence_parent_child_xref enable trigger mal_trg_licence_parent_child_xref_biu;
alter table mals_app.mal_licence_registrant_xref enable trigger mal_trg_licence_registrant_xref_biu;
alter table mals_app.mal_licence_species_code_lu enable trigger mal_trg_licence_species_code_lu_biu;
alter table mals_app.mal_licence_species_sub_code_lu enable trigger mal_trg_licence_species_sub_code_lu_biu;
alter table mals_app.mal_licence_type_lu enable trigger mal_trg_licence_type_lu_biu;
alter table mals_app.mal_licence_type_parent_child_xref enable trigger mal_trg_licence_type_parent_child_xref_biu;
alter table mals_app.mal_plant_code_lu enable trigger mal_trg_plant_code_lu_biu;
alter table mals_app.mal_premises_detail enable trigger mal_trg_premises_detail_biu;
alter table mals_app.mal_premises_job enable trigger mal_trg_premises_job_biu;
alter table mals_app.mal_print_job enable trigger mal_trg_print_job_biu;
alter table mals_app.mal_print_job_output enable trigger mal_trg_print_job_output_biu;
alter table mals_app.mal_region_lu enable trigger mal_trg_region_lu_biu;
alter table mals_app.mal_regional_district_lu enable trigger mal_trg_regional_district_lu_biu;
alter table mals_app.mal_registrant enable trigger mal_trg_registrant_biu;
alter table mals_app.mal_sale_yard_inventory enable trigger mal_trg_sale_yard_inventory_biu;
alter table mals_app.mal_sale_yard_species_code_lu enable trigger mal_trg_sale_yard_species_code_lu_biu;
alter table mals_app.mal_sale_yard_species_sub_code_lu enable trigger mal_trg_sale_yard_species_sub_code_lu_biu;
alter table mals_app.mal_site enable trigger mal_trg_site_biu;
alter table mals_app.mal_status_code_lu enable trigger mal_trg_status_code_lu_biu;
--
--
/*
Query to generate statements

	select 'REINDEX TABLE CONCURRENTLY mals_app.' || tablename || ';' from pg_tables where schemaname = 'mals_app' order by 1;
*/
--
REINDEX TABLE CONCURRENTLY mals_app.mal_add_reason_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_apiary_inspection;
REINDEX TABLE CONCURRENTLY mals_app.mal_application_role;
REINDEX TABLE CONCURRENTLY mals_app.mal_application_user;
REINDEX TABLE CONCURRENTLY mals_app.mal_city_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_species_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_species_sub_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_tank;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_test_infraction_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_test_job;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_test_result;
REINDEX TABLE CONCURRENTLY mals_app.mal_dairy_farm_test_threshold_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_delete_reason_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_fur_farm_inventory;
REINDEX TABLE CONCURRENTLY mals_app.mal_game_farm_inventory;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_comment;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_parent_child_xref;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_registrant_xref;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_species_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_species_sub_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_type_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_licence_type_parent_child_xref;
REINDEX TABLE CONCURRENTLY mals_app.mal_plant_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_premises_detail;
REINDEX TABLE CONCURRENTLY mals_app.mal_premises_job;
REINDEX TABLE CONCURRENTLY mals_app.mal_print_job;
REINDEX TABLE CONCURRENTLY mals_app.mal_print_job_output;
REINDEX TABLE CONCURRENTLY mals_app.mal_region_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_regional_district_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_registrant;
REINDEX TABLE CONCURRENTLY mals_app.mal_sale_yard_inventory;
REINDEX TABLE CONCURRENTLY mals_app.mal_sale_yard_species_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_sale_yard_species_sub_code_lu;
REINDEX TABLE CONCURRENTLY mals_app.mal_site;
REINDEX TABLE CONCURRENTLY mals_app.mal_status_code_lu;
--
--
