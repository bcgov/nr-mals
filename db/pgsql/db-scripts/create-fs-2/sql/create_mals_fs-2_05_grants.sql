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

grant select, insert, update, delete on mal_licence to mals_app_role;

--
-- TABLE:  MAL_LICENCE_COMMENT
--

grant select, insert, update, delete on mal_licence_comment to mals_app_role;

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--

grant select, insert, update, delete on mal_licence_registrant_xref to mals_app_role;

--
-- TABLE:  MAL_LICENCE_TYPE_LU
--

grant select, insert, update, delete on mal_licence_type_lu to mals_app_role;

--
-- TABLE:  MAL_PLANT_CODE_LU
--

grant select, insert, update, delete on mal_plant_code_lu to mals_app_role;

--
-- TABLE:  MAL_REGION_LU
--

grant select, insert, update, delete on mal_region_lu to mals_app_role;

--
-- TABLE:  MAL_REGIONAL_DISTRICT_LU
--

grant select, insert, update, delete on mal_regional_district_lu to mals_app_role;

--
-- TABLE:  MAL_REGISTRANT
--

grant select, insert, update, delete on mal_registrant to mals_app_role;

--
-- TABLE:  MAL_SPECIES_GAME_CODE_LU
--

grant select, insert, update, delete on mal_species_game_code_lu to mals_app_role;

--
-- TABLE:  MAL_STATUS_CODE_LU
--

grant select, insert, update, delete on mal_status_code_lu to mals_app_role;
