SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_FUR_FARM
--
alter table mal_inventory_fur_farm 
  add constraint iff_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_inventory_fur_farm 
  add constraint iff_sfcl_fk foreign key (species_fur_code_id) 
  references mal_species_fur_code_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_inventory_fur_farm 
  add constraint iff_sficl_fk foreign key (species_fur_inventory_code_id) 
  references mal_species_fur_inventory_code_lu(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_GAME_FARM
--
alter table mal_inventory_game_farm 
  add constraint igf_addrsn_fk foreign key (add_reason_code_id) 
  references mal_add_reason_code_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_inventory_game_farm 
  add constraint igf_delrsn_fk foreign key (delete_reason_code_id) 
  references mal_delete_reason_code_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_inventory_game_farm 
  add constraint igf_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_inventory_game_farm 
  add constraint igf_sfcl_fk foreign key (species_game_code_id) 
  references mal_species_game_code_lu(id) 
  on delete no action not deferrable initially immediate;
--
alter table mal_inventory_game_farm 
  add constraint igf_sficl_fk foreign key (species_game_inventory_code_id) 
  references mal_species_game_inventory_code_lu(id) 
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

alter table mal_licence 
  add constraint lic_stat_fk foreign key (status_code_id) 
  references mal_status_code_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_licence 
  add constraint lic_plnt_fk foreign key (plant_code_id) 
  references mal_plant_code_lu(id) 
  on delete no action not deferrable initially immediate;

alter table mal_licence 
  add constraint lic_specgame_fk foreign key (species_game_code_id) 
  references mal_species_game_code_lu(id) 
  on delete no action not deferrable initially immediate;

--
-- TABLE:  MAL_LICENCE_COMMENT
--
alter table mal_licence_comment 
  add constraint liccmnt_lic_fk foreign key (licence_id) 
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
-- TABLE:  MAL_REGIONAL_DISTRICT
--
alter table mal_regional_district_lu
  add constraint regdist_reg_fk foreign key (region_id) 
  references mal_region_lu(id) 
  on delete no action not deferrable initially immediate; 

--
-- TABLE:  MAL_REGISTRANT
--
alter table mal_registrant 
  add constraint regst_lic_fk foreign key (licence_id) 
  references mal_licence(id) 
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
-- TABLE:  MAL_SPECIES_DAIRY_INVENTORY_CODE_LU
--
alter table mals_app.mal_species_dairy_inventory_code_lu
  add constraint sdicl_sdcl_fk foreign key (species_dairy_code_id) 
  references mals_app.mal_species_dairy_code_lu(id) 
  on delete no action not deferrable initially immediate;
  
--
-- TABLE:  MAL_SPECIES_FUR_INVENTORY_CODE_LU
--
alter table mals_app.mal_species_fur_inventory_code_lu
  add constraint sficl_sfcl_fk foreign key (species_fur_code_id) 
  references mals_app.mal_species_fur_code_lu(id) 
  on delete no action not deferrable initially immediate;
  
--
-- TABLE:  MAL_SPECIES_GAME_INVENTORY_CODE_LU
--
alter table mals_app.mal_species_game_inventory_code_lu
  add CONSTRAINT sgicl_sgcl_fk foreign key (species_game_code_id) 
  references mals_app.mal_species_game_code_lu(id) 
  on delete no action not deferrable initially immediate;
  
--
-- TABLE:  MAL_SPECIES_SALE_INVENTORY_CODE_LU
--
alter table mals_app.mal_species_sale_inventory_code_lu
  add constraint ssicl_sscl_fk foreign key (species_sale_code_id) 
  references mals_app.mal_species_sale_code_lu(id) 
  on delete no action not deferrable initially immediate;
  