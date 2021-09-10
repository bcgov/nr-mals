SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_APPLICATION_USER
--
alter table mal_application_user 
  add constraint appusr_apprl_fk foreign key (application_role_id) 
  references mal_application_role(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_DAIRY_FARM_TEST_RESULT
--
alter table mal_dairy_farm_test_result
  add constraint dftr_dftj_fk foreign key (test_job_id) 
  references mal_dairy_farm_test_job(id) 
  on delete no action not deferrable initially immediate;

alter table mal_dairy_farm_test_result 
  add constraint dftr_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
--
-- TABLE:  MAL_FUR_FARM_INVENTORY
--
alter table mal_fur_farm_inventory 
  add constraint ffi_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_fur_farm_inventory 
  add constraint ffi_lssc_fk foreign key (species_sub_code_id) 
  references mal_licence_species_sub_code_lu(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_GAME_FARM_INVENTORY
--
alter table mal_game_farm_inventory 
  add constraint gfi_addrsn_fk foreign key (add_reason_code_id) 
  references mal_add_reason_code_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_game_farm_inventory 
  add constraint gfi_delrsn_fk foreign key (delete_reason_code_id) 
  references mal_delete_reason_code_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_game_farm_inventory 
  add constraint gfi_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_game_farm_inventory 
  add constraint gfi_lssc_fk foreign key (species_sub_code_id) 
  references mal_licence_species_sub_code_lu(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_LICENCE
--
alter table mal_licence 
  add constraint lic_lictyp_fk foreign key (licence_type_id) 
  references mal_licence_type_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_licence 
  add constraint lic_rgst_fk foreign key (primary_registrant_id) 
  references mal_registrant(id) 
  on delete no action not deferrable initially immediate;

alter table mal_licence 
  add constraint lic_reg_fk foreign key (region_id) 
  references mal_region_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_licence 
  add constraint lic_regdist_fk foreign key (regional_district_id) 
  references mal_regional_district_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_licence
  add constraint lic_lsc_fk foreign key (species_code_id) 
  references mal_licence_species_code_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_licence 
  add constraint lic_stat_fk foreign key (status_code_id) 
  references mal_status_code_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_licence 
  add constraint lic_plnt_fk foreign key (plant_code_id) 
  references mal_plant_code_lu(id) 
  on delete no action not deferrable initially immediate;
 
--
-- TABLE:  MAL_LICENCE_COMMENT
--
alter table mal_licence_comment 
  add constraint liccmnt_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate; 
 
--
-- TABLE:  MAL_LICENCE_PARENT_CHILD_XREF
--
alter table mal_licence_parent_child_xref 
  add constraint licprntchldxref_prntlic_fk foreign key (parent_licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
alter table mal_licence_parent_child_xref 
  add constraint licprntchldxref_chldlic_fk foreign key (child_licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--
alter table mal_licence_registrant_xref 
  add constraint licrgstxref_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
alter table mal_licence_registrant_xref 
  add constraint licrgstxref_rgst_fk foreign key (registrant_id) 
  references mal_registrant(id) 
  on delete no action not deferrable initially immediate;
 
--
-- TABLE:  MAL_LICENCE_TYPE_PARENT_CHILD_XREF
--
alter table mal_licence_type_parent_child_xref 
  add constraint lictypprntchldxref_prntlictyp_fk foreign key (parent_licence_type_id) 
  references mal_licence_type_lu(id) 
  on delete no action not deferrable initially immediate;
alter table mal_licence_type_parent_child_xref 
  add constraint lictypprntchldxref_chldlictyp_fk foreign key (child_licence_type_id) 
  references mal_licence_type_lu(id) 
  on delete no action not deferrable initially immediate;
 
--
-- TABLE:  MAL_REGIONAL_DISTRICT
--
alter table mal_regional_district_lu
  add constraint regdist_reg_fk foreign key (region_id) 
  references mal_region_lu(id) 
  on delete no action not deferrable initially immediate; 
 
--
-- TABLE:  MAL_SALE_YARD_INVENTORY
--
alter table mal_sale_yard_inventory 
  add constraint syi_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_sale_yard_inventory 
  add constraint syi_syssc_fk foreign key (species_sub_code_id) 
  references mal_sale_yard_species_sub_code_lu(id) 
  on delete no action not deferrable initially immediate;
 
--
-- TABLE:  MAL_SITE
--
alter table mal_site 
  add constraint site_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;

alter table mal_site 
  add constraint sitr_reg_fk foreign key (region_id) 
  references mal_region_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_site 
  add constraint site_regdist_fk foreign key (regional_district_id) 
  references mal_regional_district_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_site 
  add constraint site_stat_fk foreign key (status_code_id) 
  references mal_status_code_lu(id) 
  on delete no action not deferrable initially immediate; 

--
-- TABLE:  MAL_DAIRY_FARM_TANK
--
alter table mal_dairy_farm_tank
  add constraint dft_site_fk foreign key (site_id) 
  references mal_site(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_DAIRY_FARM_SPECIES_SUB_CODE_LU
--
alter table mal_dairy_farm_species_sub_code_lu
  add constraint dfssc_dfsc_fk foreign key (species_code_id) 
  references mal_dairy_farm_species_code_lu(id) 
  on delete no action not deferrable initially immediate;
  
--
-- TABLE:  MAL_LICENCE_SPECIES_CODE_LU
--
alter table mal_licence_species_code_lu
  add constraint lsc_lictyp_fk foreign key (licence_type_id) 
  references mal_licence_type_lu(id) 
  on delete no action not deferrable initially immediate;
  
--
-- TABLE:  MAL_LICENCE_SPECIES_SUB_CODE_LU
--
alter table mal_licence_species_sub_code_lu
  add constraint lssc_sc_fk foreign key (species_code_id) 
  references mal_licence_species_code_lu(id) 
  on delete no action not deferrable initially immediate;
  
--
-- TABLE:  MAL_SALE_YARD_SPECIES_SUB_CODE_LU
--
alter table mal_sale_yard_species_sub_code_lu
  add constraint syssc_sysc_fk foreign key (species_code_id) 
  references mal_sale_yard_species_code_lu(id) 
  on delete no action not deferrable initially immediate;
  