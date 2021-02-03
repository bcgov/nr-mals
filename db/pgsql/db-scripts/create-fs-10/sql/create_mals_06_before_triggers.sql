SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

-- TABLE:  MAL_ADD_REASON_CODE_LU
--
create trigger trg_mal_add_reason_code_lu_biu
before insert or update on mal_add_reason_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_DELETE_REASON_CODE_LU
--
create trigger trg_mal_delete_reason_code_lu_biu
before insert or update on mal_delete_reason_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_INVENTORY_FUR_FARM
--
create trigger trg_mal_inventory_fur_farm_biu
before insert or update on mal_inventory_fur_farm
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_INVENTORY_GAME_FARM
--
create trigger trg_mal_inventory_game_farm_biu
before insert or update on mal_inventory_game_farm
  for each row execute function fn_update_audit_columns();
 
--
-- TABLE:  MAL_LICENCE
--
create trigger trg_mal_licence_biu
before insert or update on mal_licence
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_LICENCE_COMMENT
--
create trigger trg_mal_licence_comment_biu
before insert or update on mal_licence_comment
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--
create trigger trg_mal_licence_registrant_xref_biu
before insert or update on mal_licence_registrant_xref
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_LICENCE_TYPE_LU
--
create trigger trg_mal_licence_type_lu_biu
before insert or update on mal_licence_type_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_PLANT_CODE_LU
--
create trigger trg_mal_plant_code_lu_biu
before insert or update on mal_plant_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_REGION_LU
--
create trigger trg_mal_region_lu_biu
before insert or update on mal_region_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_REGIONAL_DISTRICT_LU
--
create trigger trg_mal_regional_district_lu_biu
before insert or update on mal_regional_district_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_REGISTRANT
--
create trigger trg_mal_site_biu
before insert or update on mal_site
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_SITE
--
create trigger trg_mal_registrant_biu
before insert or update on mal_registrant
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_DAIRY_CODE_LU
--
create trigger trg_mal_species_dairy_code_lu_biu
before insert or update on mal_species_dairy_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_DAIRY_INVENTORY_CODE_LU
--
create trigger trg_mal_species_dairy_inventory_code_lu_biu
before insert or update on mal_species_dairy_inventory_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_FUR_CODE_LU
--
create trigger trg_mal_species_fur_code_lu_biu
before insert or update on mal_species_fur_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_FUR_INVENTORY_CODE_LU
--
create trigger trg_mal_species_fur_inventory_code_lu_biu
before insert or update on mal_species_fur_inventory_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_SPECIES_GAME_CODE_LU
--
create trigger trg_mal_species_game_code_lu_biu
before insert or update on mal_species_game_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_GAME_INVENTORY_CODE_LU
--
create trigger trg_mal_species_game_inventory_code_lu_biu
before insert or update on mal_species_game_inventory_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_SALE_CODE_LU
--
create trigger trg_mal_species_sale_code_lu_biu
before insert or update on mal_species_sale_code_lu
  for each row execute function fn_update_audit_columns();

-- TABLE:  MAL_SPECIES_SALE_INVENTORY_CODE_LU
--
create trigger trg_mal_species_sale_inventory_code_lu_biu
before insert or update on mal_species_sale_inventory_code_lu
  for each row execute function fn_update_audit_columns();

--
-- TABLE:  MAL_STATUS_CODE_LU
--
create trigger trg_mal_status_code_lu_biu
before insert or update on mal_status_code_lu
  for each row execute function fn_update_audit_columns();
