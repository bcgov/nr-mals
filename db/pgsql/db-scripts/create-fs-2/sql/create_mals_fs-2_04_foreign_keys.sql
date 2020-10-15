SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- TABLE:  MAL_LICENCE
--

alter table mal_licence 
  add constraint lic_lictyp_fk foreign key (licence_type_id) 
  references mal_licence_type_lu(id) 
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
 