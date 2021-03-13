SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_ADD_REASON_CODE_LU
--
create trigger mal_trg_add_reason_code_lu_biu
before insert or update on mal_add_reason_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_CITY_LU
--
create trigger mal_trg_city_lu_biu
before insert or update on mal_city_lu
  for each row execute function fn_update_audit_columns();
 
--
-- TABLE:  MAL_DAIRY_FARM_TANK
--
create trigger mal_trg_dairy_farm_tank_biu
before insert or update on mal_dairy_farm_tank
  for each row execute function fn_update_audit_columns();
 
--
-- TABLE:  MAL_DAIRY_FARM_SPECIES_CODE_LU
--
create trigger mal_trg_dairy_farm_species_code_lu_biu
before insert or update on mal_dairy_farm_species_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_DAIRY_FARM_SPECIES_SUB_CODE_LU
--
create trigger mal_trg_dairy_farm_species_sub_code_lu_biu
before insert or update on mal_dairy_farm_species_sub_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_DELETE_REASON_CODE_LU
--
create trigger mal_trg_delete_reason_code_lu_biu
before insert or update on mal_delete_reason_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_FUR_FARM_INVENTORY
--
create trigger mal_trg_fur_farm_inventory_biu
before insert or update on mal_fur_farm_inventory
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_FUR_FARM_SPECIES_CODE_LU
--
create trigger mal_trg_fur_farm_species_code_lu_biu
before insert or update on mal_fur_farm_species_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_FUR_FARM_SPECIES_SUB_CODE_LU
--
create trigger mal_trg_fur_farm_species_sub_code_lu_biu
before insert or update on mal_fur_farm_species_sub_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_GAME_FARM_INVENTORY
--
create trigger mal_trg_game_farm_inventory_biu
before insert or update on mal_game_farm_inventory
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_GAME_FARM_SPECIES_CODE_LU
--
create trigger mal_trg_game_farm_species_code_lu_biu
before insert or update on mal_game_farm_species_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_GAME_FARM_SPECIES_SUB_CODE_LU
--
create trigger mal_trg_game_farm_species_sub_code_lu_biu
before insert or update on mal_game_farm_species_sub_code_lu
  for each row execute function fn_update_audit_columns();
 
--
-- TABLE:  MAL_LICENCE
--
create trigger mal_trg_licence_biu
before insert or update on mal_licence
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_LICENCE_COMMENT
--
create trigger mal_trg_licence_comment_biu
before insert or update on mal_licence_comment
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--
create trigger mal_trg_licence_registrant_xref_biu
before insert or update on mal_licence_registrant_xref
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_LICENCE_TYPE_LU
--
create trigger mal_trg_licence_type_lu_biu
before insert or update on mal_licence_type_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_PLANT_CODE_LU
--
create trigger mal_trg_plant_code_lu_biu
before insert or update on mal_plant_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_REGION_LU
--
create trigger mal_trg_region_lu_biu
before insert or update on mal_region_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_REGIONAL_DISTRICT_LU
--
create trigger mal_trg_regional_district_lu_biu
before insert or update on mal_regional_district_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_REGISTRANT
--
create trigger mal_trg_site_biu
before insert or update on mal_site
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_SALE_YARD_SPECIES_CODE_LU
--
create trigger mal_trg_sale_yard_species_code_lu_biu
before insert or update on mal_sale_yard_species_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_SALE_YARD_SPECIES_SUB_CODE_LU
--
create trigger mal_trg_sale_yard_species_sub_code_lu_biu
before insert or update on mal_sale_yard_species_sub_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_SITE
--
create trigger mal_trg_registrant_biu
before insert or update on mal_registrant
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_STATUS_CODE_LU
--
create trigger mal_trg_status_code_lu_biu
before insert or update on mal_status_code_lu
  for each row execute function fn_update_audit_columns();
