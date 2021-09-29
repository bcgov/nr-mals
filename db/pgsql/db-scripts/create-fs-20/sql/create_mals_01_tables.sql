SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;	
	
--
-- DROP:  ALL TABLES
--

DROP TABLE IF EXISTS mal_licence_parent_child_xref       CASCADE;
DROP TABLE IF EXISTS mal_licence_registrant_xref         CASCADE;

DROP TABLE IF EXISTS mal_add_reason_code_lu              CASCADE;
DROP TABLE IF EXISTS mal_apiary_inspection               CASCADE;
DROP TABLE IF EXISTS mal_application_role                CASCADE;
DROP TABLE IF EXISTS mal_application_user                CASCADE;
DROP TABLE IF EXISTS mal_delete_reason_code_lu           CASCADE;
DROP TABLE IF EXISTS mal_licence_type_parent_child_xref  CASCADE;
DROP TABLE IF EXISTS mal_licence_type_lu                 CASCADE;
DROP TABLE IF EXISTS mal_plant_code_lu                   CASCADE;
DROP TABLE IF EXISTS mal_regional_district_lu            CASCADE;
DROP TABLE IF EXISTS mal_region_lu                       CASCADE;
DROP TABLE IF EXISTS mal_status_code_lu                  CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_species_code_lu      CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_species_sub_code_lu  CASCADE;
DROP TABLE IF EXISTS mal_licence_species_code_lu         CASCADE;
DROP TABLE IF EXISTS mal_licence_species_sub_code_lu     CASCADE;
DROP TABLE IF EXISTS mal_city_lu                         CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_test_infraction_lu   CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_test_threshold_lu    CASCADE;
DROP TABLE IF EXISTS mal_sale_yard_species_code_lu       CASCADE;
DROP TABLE IF EXISTS mal_sale_yard_species_sub_code_lu   CASCADE;

DROP TABLE IF EXISTS mal_dairy_farm_test_result          CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_test_job             CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_tank                 CASCADE;
DROP TABLE IF EXISTS mal_fur_farm_inventory              CASCADE;
DROP TABLE IF EXISTS mal_game_farm_inventory             CASCADE;
DROP TABLE IF EXISTS mal_sale_yard_inventory             CASCADE;
DROP TABLE IF EXISTS mal_licence_comment                 CASCADE;
DROP TABLE IF EXISTS mal_registrant                      CASCADE;
DROP TABLE IF EXISTS mal_site                            CASCADE;
DROP TABLE IF EXISTS mal_licence                         CASCADE;

DROP TABLE IF EXISTS mal_print_job_output                CASCADE;
DROP TABLE IF EXISTS mal_print_job                       CASCADE;

--
-- TABLE:  MAL_ADD_REASON_CODE_LU
--

CREATE TABLE mal_add_reason_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_add_reason_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_arcd_code_name_uk ON mal_add_reason_code_lu (code_name);

--
-- TABLE:  MAL_APIARY_INSPECTION
--

CREATE TABLE mal_apiary_inspection (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	site_id integer NOT NULL,
	inspection_date timestamp NOT NULL,
	inspector_id varchar(10),
	colonies_tested integer,
	brood_tested integer,
	varroa_tested integer,
	small_hive_beetle_tested integer,
	american_foulbrood_result integer,
	european_foulbrood_result integer,
	small_hive_beetle_result integer,
	chalkbrood_result integer,
	sacbrood_result integer,
	nosema_result integer,
	varroa_mite_result integer,
	varroa_mite_result_percent numeric(5,2),
	other_result_description varchar(240),
	supers_inspected integer,
	supers_destroyed integer,
	inspection_comment varchar(2000),
	old_identifier varchar(100),
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_apiary_inspection ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_APPLICATION_ROLE
--

CREATE TABLE mal_application_role (
	id integer generated always as identity (start with 1 increment by 1) NOT NULL,
	role_name varchar(50) UNIQUE NOT NULL,
	role_description varchar(120) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_application_role ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_apprl_code_name_uk ON mal_application_role (role_name);

--
-- TABLE:  MAL_APPLICATION_USER
--

CREATE TABLE mal_application_user (
	id integer generated always as identity (start with 1 increment by 1) NOT NULL,
	application_role_id integer,
	user_name varchar(50) UNIQUE NOT NULL,
	surname varchar(50) NOT NULL,
	given_name_1 varchar(50) NOT NULL,
	given_name_2 varchar(50),
	given_name_3 varchar(50),
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_application_user ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_appusr_code_name_uk ON mal_application_user (user_name);

--
-- TABLE:  MAL_CITY_LU
--
CREATE TABLE mal_city_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	city_name varchar(50) UNIQUE NOT NULL,
	city_description varchar(120) NOT NULL,
	province_code varchar(2) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_city_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mcl_city_name_province_code_uk ON mal_city_lu (city_name, province_code);

--
-- TABLE:  MAL_DAIRY_FARM_SPECIES_CODE_LU
--

CREATE TABLE mal_dairy_farm_species_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_species_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_dfsc_code_name_uk on mal_dairy_farm_species_code_lu using btree (code_name);
	
--
-- TABLE:  MAL_DAIRY_FARM_SPECIES_SUB_CODE_LU
--

CREATE TABLE mal_dairy_farm_species_sub_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_dfssc_id_code_uk on mal_dairy_farm_species_sub_code_lu using btree (species_code_id, code_name);

--
-- TABLE:  MAL_DAIRY_FARM_TANK
--

CREATE TABLE mal_dairy_farm_tank (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	site_id integer NOT NULL,
	serial_number varchar(30),
	calibration_date timestamp,
	issue_date timestamp,
	company_name varchar(100),
	model_number varchar(30),
	tank_capacity varchar(30),
	recheck_year varchar(4),
	print_recheck_notice boolean DEFAULT false,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_tank ADD PRIMARY KEY (id);
CREATE INDEX mal_dryfrmtnk_site_id_idx on mal_dairy_farm_tank using btree (site_id);
CREATE INDEX mal_dryfrmtnk_serial_number_idx on mal_dairy_farm_tank using btree (serial_number);

--
-- TABLE:  MAL_DAIRY_FARM_TEST_JOB
--

CREATE TABLE mal_dairy_farm_test_job (
	id integer generated by default as identity (start with 1 increment by 1) NOT NULL,	
	job_status varchar(50) NOT NULL,
	job_source varchar(30) NOT NULL,
	execution_start_time timestamp NOT NULL,
	execution_end_time timestamp,
	source_row_count integer,
	target_insert_count integer,
	target_update_count integer,
	execution_comment varchar(2000),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_test_job ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_DAIRY_FARM_TEST_RESULT
--

CREATE TABLE mal_dairy_farm_test_result (
	id integer generated always as identity (start with 1 increment by 1) NOT NULL,
	test_job_id integer NOT NULL,	
	licence_id integer NOT NULL,
	irma_number varchar(5),
	plant_code varchar(2),
	test_month integer,
	test_year integer,
	spc1_day varchar(2),
	spc1_date date,
	spc1_value numeric(10,2),
	spc1_infraction_flag boolean,
	spc1_previous_infraction_first_date date,
	spc1_previous_infraction_count integer,	
	spc1_levy_percentage integer,
	spc1_correspondence_code varchar(50),
	spc1_correspondence_description varchar(120),	
	scc_day varchar(2),
	scc_date date,
	scc_value numeric(10,2),
	scc_infraction_flag boolean,
	scc_previous_infraction_first_date date,
	scc_previous_infraction_count integer,	
	scc_levy_percentage integer,
	scc_correspondence_code varchar(50),
	scc_correspondence_description varchar(120),	
	cry_day varchar(2),
	cry_date date,
	cry_value numeric(10,2),
	cry_infraction_flag boolean,
	cry_previous_infraction_first_date date,
	cry_previous_infraction_count integer,	
	cry_levy_percentage integer,
	cry_correspondence_code varchar(50),
	cry_correspondence_description varchar(120),	
	ffa_day varchar(2),
	ffa_date date,
	ffa_value numeric(10,2),
	ffa_infraction_flag boolean,
	ffa_previous_infraction_first_date date,
	ffa_previous_infraction_count integer,	
	ffa_levy_percentage integer,
	ffa_correspondence_code varchar(50),
	ffa_correspondence_description varchar(120),	
	ih_day varchar(2),
	ih_date date,
	ih_value numeric(10,2),
	ih_infraction_flag boolean,
	ih_previous_infraction_first_date date,
	ih_previous_infraction_count integer,	
	ih_levy_percentage integer,
	ih_correspondence_code varchar(50),
	ih_correspondence_description varchar(120),	
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_test_result ADD PRIMARY KEY (id);
CREATE INDEX mal_dryfrmtst_test_job_id_idx ON mal_dairy_farm_test_result (test_job_id);		
ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmaspc1_uk UNIQUE (irma_number, test_year, test_month, spc1_day);
ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmascc_uk UNIQUE (irma_number, test_year, test_month, scc_day);
ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmacry_uk UNIQUE (irma_number, test_year, test_month, cry_day);
ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmaffa_uk UNIQUE (irma_number, test_year, test_month, ffa_day);
ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmaih_uk UNIQUE (irma_number, test_year, test_month, ih_day);

--
-- TABLE:  MAL_DAIRY_FARM_TEST_THRESHOLD_LU
--

CREATE TABLE mal_dairy_farm_test_threshold_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_code varchar(50) NOT NULL,
	species_sub_code varchar(50) NOT NULL,
	upper_limit numeric(8,2) NOT NULL,
	infraction_window varchar(30) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_test_threshold_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_DAIRY_FARM_TEST_INFRACTION_LU
--

CREATE TABLE mal_dairy_farm_test_infraction_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	test_threshold_id integer  NOT NULL,	
	previous_infractions_count integer NOT NULL,
	levy_percentage integer,
	correspondence_code varchar(50) NOT NULL,
	correspondence_description varchar(120) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_test_infraction_lu ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_DELETE_REASON_CODE_LU
--

CREATE TABLE mal_delete_reason_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_delete_reason_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_drcd_code_name_uk ON mal_delete_reason_code_lu (code_name);

--
-- TABLE:  MAL_FUR_FARM_INVENTORY
--

CREATE TABLE mal_fur_farm_inventory (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	species_sub_code_id integer NOT NULL,
	recorded_date timestamp NOT NULL,
	recorded_value double precision NOT NULL,
	old_identifier varchar(100),
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_fur_farm_inventory ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_furfrminv_uidx ON mal_fur_farm_inventory (licence_id, species_sub_code_id, recorded_date);
ALTER TABLE mal_fur_farm_inventory ADD CONSTRAINT inv_furfrminv_uk UNIQUE USING INDEX inv_furfrminv_uidx;
CREATE INDEX mal_furfrminv_licence_id_idx ON mal_fur_farm_inventory (licence_id);
CREATE INDEX mal_furfrminv_species_sub_code_id_idx ON mal_fur_farm_inventory (species_sub_code_id);

--
-- TABLE:  MAL_GAME_FARM_INVENTORY
--

CREATE TABLE mal_game_farm_inventory (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	species_sub_code_id integer NOT NULL,
	add_reason_code_id integer NULL, 
	delete_reason_code_id integer NULL, 
	recorded_date timestamp NOT NULL,
	recorded_value double precision NOT NULL,	
	tag_number varchar(10) NULL,
	abattoir_value varchar(20) NULL,
	buyer_seller  varchar(50) NULL,	
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
COMMENT ON COLUMN mal_game_farm_inventory.tag_number IS E'The unique number of the tag for this animal.';
ALTER TABLE mal_game_farm_inventory ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_gamfrminv_uidx ON mal_game_farm_inventory (licence_id, species_sub_code_id, recorded_date, tag_number);
ALTER TABLE mal_game_farm_inventory ADD CONSTRAINT inv_gamfrminv_uk UNIQUE USING INDEX inv_gamfrminv_uidx;
CREATE INDEX mal_gamfrminv_licence_id_idx ON mal_game_farm_inventory (licence_id);
CREATE INDEX mal_gamfrminv_species_species_sub_code_id_idx ON mal_game_farm_inventory (species_sub_code_id);

--
-- TABLE:  MAL_LICENCE
--

CREATE TABLE mal_licence (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_number integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	irma_number varchar(10),
	licence_type_id integer NOT NULL,
	status_code_id integer NOT NULL,
	primary_registrant_id integer,
	region_id integer,
	regional_district_id integer, 
	plant_code_id integer,
	species_code_id integer,
	company_name varchar(200),
	company_name_override boolean,
	address_line_1 varchar(100),
	address_line_2 varchar(100),
	city varchar(35),
	province varchar(4),
	postal_code varchar(6),
	country varchar(50),
	mail_address_line_1 varchar(100),
	mail_address_line_2 varchar(100),
	mail_city varchar(35),
	mail_province varchar(4),
	mail_postal_code varchar(6),
	mail_country varchar(50),
	gps_coordinates varchar(50),
	primary_phone varchar(10),
	secondary_phone varchar(10),
	fax_number varchar(10),	
	application_date date,
	issue_date date,
	expiry_date date,
	reissue_date date,
	fee_collected numeric(10,2),
	fee_collected_ind boolean NOT NULL DEFAULT false,	
	bond_carrier_phone_number varchar(10),
	bond_number varchar(50),
	bond_value numeric(10,2),
	bond_carrier_name varchar(50),
	bond_continuation_expiry_date date,	
	dpl_approved_date date,
	dpl_received_date date,
	exam_date date,
	exam_fee numeric(10,2),
	dairy_levy numeric(38),
	df_active_ind boolean,
	hives_per_apiary integer,
	total_hives integer,
	licence_details varchar(2000),
	former_irma_number varchar(10),
	old_identifier varchar(100),
	action_required boolean,
	print_certificate boolean,
	print_renewal boolean,
	print_dairy_infraction boolean,
	legacy_game_farm_species_code varchar(10),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence ADD PRIMARY KEY (id);
CREATE INDEX mal_lic_licence_type_id_idx      on mal_licence using btree (licence_type_id);
CREATE INDEX mal_lic_plant_code_idx           on mal_licence using btree (plant_code_id);
CREATE INDEX mal_lic_print_certificate_idx    on mal_licence using btree (print_certificate);
CREATE INDEX mal_lic_region_id_idx            on mal_licence using btree (region_id);
CREATE INDEX mal_lic_regional_district_id_idx on mal_licence using btree (regional_district_id);
CREATE INDEX mal_lic_status_code_id_idx       on mal_licence using btree (status_code_id);
CREATE INDEX mal_lic_irma_number_idx          on mal_licence using btree (irma_number);
CREATE INDEX mal_lic_company_name_idx         on mal_licence using btree (company_name);

--
-- TABLE:  MAL_LICENCE_COMMENT
--

CREATE TABLE mal_licence_comment (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	licence_comment varchar(4000) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_comment ADD PRIMARY KEY (id);
CREATE INDEX mal_liccmnt_license_id_idx on mal_licence_comment using btree (licence_id);

--
-- TABLE:  MAL_LICENCE_PARENT_CHILD_XREF
--

CREATE TABLE mal_licence_parent_child_xref (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	parent_licence_id integer NOT NULL,
	child_licence_id integer NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_parent_child_xref ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_licprntchld_uk ON mal_licence_parent_child_xref (parent_licence_id,child_licence_id);

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--

CREATE TABLE mal_licence_registrant_xref (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	registrant_id integer NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_registrant_xref ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_licregxref_uk ON mal_licence_registrant_xref (licence_id,registrant_id);
	
--
-- TABLE:  MAL_LICENCE_SPECIES_CODE_LU
--

CREATE TABLE mal_licence_species_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_type_id integer NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_species_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_lsc_code_name_uk on mal_licence_species_code_lu using btree (licence_type_id,code_name);
	
--
-- TABLE:  MAL_LICENCE_SPECIES_SUB_CODE_LU
--

CREATE TABLE mal_licence_species_sub_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_lssc_id_code_uk on mal_licence_species_sub_code_lu using btree (species_code_id, code_name);

--
-- TABLE:  MAL_LICENCE_TYPE_LU
--

CREATE TABLE mal_licence_type_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_type varchar(50) UNIQUE NOT NULL,
	standard_fee numeric(10,2) NOT NULL,
	licence_term integer NOT NULL,
	standard_issue_date timestamp,
	standard_expiry_date timestamp,
	renewal_notice smallint,
	active_flag boolean NOT NULL,
	legislation varchar(2000) NOT NULL,
	regulation varchar(2000),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_type_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_lictyp_licence_name_uk ON mal_licence_type_lu (licence_type, standard_issue_date);

--
-- TABLE:  MAL_LICENCE_TYPE_PARENT_CHILD_XREF
--

CREATE TABLE mal_licence_type_parent_child_xref (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	parent_licence_type_id integer NOT NULL,
	child_licence_type_id integer NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence_type_parent_child_xref ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_lictypprntchld_uk ON mal_licence_type_parent_child_xref (parent_licence_type_id,child_licence_type_id);

--
-- TABLE:  MAL_PLANT_CODE_LU
--

CREATE TABLE mal_plant_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_plant_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_plntcd_code_name_uk ON mal_plant_code_lu (code_name);

--
-- TABLE:  MAL_PRINT_JOB
--

CREATE TABLE mal_print_job (
	id integer generated by default as identity (start with 1 increment by 1) NOT NULL,	
	print_job_number integer generated always as identity (start with 1 increment by 1) NOT NULL,	
	job_status varchar(30),
	print_category varchar(100) NOT NULL,
	execution_start_time timestamp NOT NULL,
	json_end_time timestamp,
	document_end_time timestamp,
	certificate_json_count integer default 0,
	envelope_json_count integer default 0,
	card_json_count integer default 0,
	renewal_json_count integer default 0,
	dairy_infraction_json_count integer default 0,
	recheck_notice_json_count integer default 0,
	report_json_count integer default 0,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_print_job ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_PRINT_JOB_OUTPUT
--

CREATE TABLE mal_print_job_output (
	id integer generated always as identity (start with 1 increment by 1) NOT NULL,
	print_job_id integer NOT NULL,
	licence_type varchar(100),
	licence_number varchar(30),
	document_type varchar(30) NOT NULL,
	document_json json,
	document_binary bytea,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_print_job_output ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_REGION_LU
--

CREATE TABLE mal_region_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	region_number varchar(50) NOT NULL,
	region_name varchar(200) UNIQUE NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_region_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_reg_region_number_uk on mal_region_lu using btree (region_number);

--
-- TABLE:  MAL_REGIONAL_DISTRICT_LU
--

CREATE TABLE mal_regional_district_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	region_id integer NOT NULL,
	district_number varchar(50) NOT NULL,
	district_name varchar(200) NOT NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_regional_district_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_regdist_region_district_uk on mal_regional_district_lu using btree (region_id, district_number);

--
-- TABLE:  MAL_REGISTRANT
--

CREATE TABLE mal_registrant (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	first_name varchar(200),
	last_name varchar(200),
	middle_initials varchar(3),
	official_title varchar(200),
	primary_phone varchar(10),
	secondary_phone varchar(10),
	fax_number varchar(10),
	email_address varchar(128),
	old_identifier varchar(100),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_registrant ADD PRIMARY KEY (id);
CREATE INDEX mal_rgst_last_name_idx on mal_registrant using btree (last_name);

--
-- TABLE:  MAL_SALE_YARD_INVENTORY
--
CREATE TABLE mal_sale_yard_inventory (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	species_sub_code_id integer,
	recorded_date timestamp NOT NULL,
	recorded_value double precision NOT NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_sale_yard_inventory ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_saleyardinv_uidx ON mal_sale_yard_inventory (licence_id, species_sub_code_id, recorded_date);
ALTER TABLE mal_sale_yard_inventory ADD CONSTRAINT inv_saleyardinv_uk UNIQUE USING INDEX inv_saleyardinv_uidx;
CREATE INDEX mal_saleyardinv_licence_id_idx ON mal_sale_yard_inventory (licence_id);
CREATE INDEX mal_saleyardinv_species_sub_code_id_idx ON mal_sale_yard_inventory (species_sub_code_id);

--
-- TABLE:  MAL_SALE_YARD_SPECIES_CODE_LU
--

CREATE TABLE mal_sale_yard_species_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_sale_yard_species_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_sysc_code_name_uk on mal_sale_yard_species_code_lu using btree (code_name);
	
--
-- TABLE:  MAL_SALE_YARD_SPECIES_SUB_CODE_LU
--

CREATE TABLE mal_sale_yard_species_sub_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_sale_yard_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_syssc_id_code_uk on mal_sale_yard_species_sub_code_lu using btree (species_code_id, code_name);

--
-- TABLE:  MAL_SITE
--

CREATE TABLE mal_site (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	apiary_site_id integer,
	region_id integer,
	regional_district_id integer,
	status_code_id integer,
	registration_date timestamp,
	deactivation_date timestamp,
	inspector_name  varchar(200),
	inspection_date timestamp,
	next_inspection_date timestamp,
	hive_count integer,
	contact_name varchar(50),
	primary_phone varchar(10),
	secondary_phone varchar(10),
	fax_number varchar(10),
	address_line_1 varchar(100),
	address_line_2 varchar(100),
	city varchar(35),
	province varchar(4),
	postal_code varchar(6),
	country varchar(50),
	gps_coordinates varchar(50),
	legal_description varchar(2000),
	site_details varchar(2000),
	parcel_identifier varchar(2000),
	old_identifier varchar(100),
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_site ADD PRIMARY KEY (id);
CREATE INDEX mal_site_license_id_idx on mal_site using btree (licence_id);
CREATE INDEX mal_site_contact_name_idx on mal_site using btree (contact_name);

--
-- TABLE:  MAL_STATUS_CODE_LU
--

CREATE TABLE mal_status_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_status_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_statcd_code_name_uk on mal_status_code_lu using btree (code_name);
