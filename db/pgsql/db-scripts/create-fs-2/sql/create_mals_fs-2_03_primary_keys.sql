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

ALTER TABLE mal_licence ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_LICENCE_COMMENT
--

ALTER TABLE mal_licence_comment ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--

ALTER TABLE mal_licence_registrant_xref ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_LICENCE_TYPE_LU
--

ALTER TABLE mal_licence_type_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_PLANT_CODE_LU
--

ALTER TABLE mal_plant_code_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_REGION_LU
--

ALTER TABLE mal_region_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_REGIONAL_DISTRICT_LU
--

ALTER TABLE mal_regional_district_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_REGISTRANT
--

ALTER TABLE mal_registrant ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_SPECIES_GAME_CODE_LU
--

ALTER TABLE mal_species_game_code_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_STATUS_CODE_LU
--

ALTER TABLE mal_status_code_lu ADD PRIMARY KEY (id);