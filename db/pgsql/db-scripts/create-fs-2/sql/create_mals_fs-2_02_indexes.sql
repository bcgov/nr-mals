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
  
create index mal_lic_irma_number_idx          on mal_licence using btree (irma_number);
create index mal_lic_licence_type_id_idx      on mal_licence using btree (licence_type_id);
create index mal_lic_person_id_idx            on mal_licence using btree (person_id);
create index mal_lic_region_id_idx            on mal_licence using btree (region_id);
create index mal_lic_regional_district_id_idx on mal_licence using btree (regional_district_id);
create index mal_lic_status_code_id_idx       on mal_licence using btree (status_code_id);

--
-- TABLE:  MAL_LICENCE_COMMENT
--

create index mal_liccmnt_license_id_idx on mal_licence_comment using btree (licence_id);

--
-- TABLE:  MAL_REGISTRANT
--

create index mal_rgst_last_name_idx on mal_registrant using btree (last_name);
create index mal_rgst_company_name_idx on mal_registrant using btree (company_name);