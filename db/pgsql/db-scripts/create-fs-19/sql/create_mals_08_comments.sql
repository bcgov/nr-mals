SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;	


COMMENT ON TABLE mal_add_reason_code_lu              IS 'Reasons for additions to the Garm Farm Inventory.';

COMMENT ON TABLE mal_apiary_inspection               IS 'Inspections are recorded at the site level.';

COMMENT ON TABLE mal_application_role                IS 'Used by the application to define authourization.';

COMMENT ON TABLE mal_application_user                IS 'Used by the application to define authentication.';

COMMENT ON TABLE mal_city_lu                         IS 'The City list will be used by the app, though the end users may enter their own City values. There exist no foreign keys to this table.';

COMMENT ON TABLE mal_dairy_farm_species_code_lu      IS 'This table is not used as only FRMQA tests are recorded since 2013.';

COMMENT ON TABLE mal_dairy_farm_species_sub_code_lu  IS 'This table is not used as only FRMQA tests are recorded since 2013 and the Sub Species are not recorded.';

COMMENT ON TABLE mal_dairy_farm_tank                 IS 'Tank details. Stored in the Site Details column in the previous data model.';

COMMENT ON TABLE mal_dairy_farm_test_infraction_lu   IS 'The actions to take when an infraction occurs.';

COMMENT ON TABLE mal_dairy_farm_test_job             IS 'Batch job summary for loading the CSV data.';

COMMENT ON TABLE mal_dairy_farm_test_result          IS 'Batch job details for loading the CSV data.';

COMMENT ON TABLE mal_dairy_farm_test_threshold_lu    IS 'The threshold at which infractions are determined.';

COMMENT ON TABLE mal_delete_reason_code_lu           IS 'Reasons for additions to the Garm Farm Inventory.';

COMMENT ON TABLE mal_fur_farm_inventory              IS 'Inventory details per Licence, per Species Sub Code.';

COMMENT ON TABLE mal_game_farm_inventory             IS 'Inventory details per Licence, per Species Sub Code.';

COMMENT ON TABLE mal_licence                         IS 'Licences are the central component of the MALS application, around which all other data is modeled.';

COMMENT ON TABLE mal_licence_comment                 IS 'A Licence may have one or more comments associated with it.';

COMMENT ON TABLE mal_licence_parent_child_xref       IS 'Cross reference for parent Licences and child Licences.';

COMMENT ON TABLE mal_licence_registrant_xref         IS 'Cross reference between Licences and non-primary Registrants.';

COMMENT ON TABLE mal_licence_species_code_lu         IS 'Species codes for Fur Farm and Game Farm licences.';

COMMENT ON TABLE mal_licence_species_sub_code_lu     IS 'Species sub codes for Fur Farm and Game Farm licences.';

COMMENT ON TABLE mal_licence_type_lu                 IS 'Much of the application functionality is based on the Licence Type.';

COMMENT ON TABLE mal_licence_type_parent_child_xref  IS 'Cross reference for parent Licence Types and child Licence Types.';

COMMENT ON TABLE mal_plant_code_lu                   IS 'Dairy Farm plant codes.';

COMMENT ON TABLE mal_print_job                       IS 'Batch job summary for Certificate, Renewal and Report runs.';

COMMENT ON TABLE mal_print_job_output                IS 'Batch job details for Certificate, Renewal and Report runs.';

COMMENT ON TABLE mal_region_lu                       IS 'BC Regions.';

COMMENT ON TABLE mal_regional_district_lu            IS 'BC Districts.';

COMMENT ON TABLE mal_registrant                      IS 'People who hold, or are associated with, Licences.';

COMMENT ON TABLE mal_sale_yard_inventory             IS 'Inventory details per Licence, per Species Sub Code.';

COMMENT ON TABLE mal_sale_yard_species_code_lu       IS 'Species codes for Sale Yard licences.';

COMMENT ON TABLE mal_sale_yard_species_sub_code_lu   IS 'Species sub codes for Sale Yard licences.';

COMMENT ON TABLE mal_site                            IS 'Licences may have one or more sites associated with it.';

COMMENT ON TABLE mal_status_code_lu                  IS 'Statuses for Licences and Sites.';
