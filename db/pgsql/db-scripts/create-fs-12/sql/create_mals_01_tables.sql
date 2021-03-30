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

DROP TABLE IF EXISTS mal_add_reason_code_lu              CASCADE;
DROP TABLE IF EXISTS mal_delete_reason_code_lu           CASCADE;
DROP TABLE IF EXISTS mal_licence_type_lu                 CASCADE;
DROP TABLE IF EXISTS mal_plant_code_lu                   CASCADE;
DROP TABLE IF EXISTS mal_regional_district_lu            CASCADE;
DROP TABLE IF EXISTS mal_region_lu                       CASCADE;
DROP TABLE IF EXISTS mal_status_code_lu                  CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_species_code_lu      CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_species_sub_code_lu  CASCADE;
DROP TABLE IF EXISTS mal_fur_farm_species_code_lu        CASCADE;
DROP TABLE IF EXISTS mal_fur_farm_species_sub_code_lu    CASCADE;
DROP TABLE IF EXISTS mal_game_farm_species_code_lu       CASCADE;
DROP TABLE IF EXISTS mal_game_farm_species_sub_code_lu   CASCADE;
DROP TABLE IF EXISTS mal_sale_yard_species_code_lu       CASCADE;
DROP TABLE IF EXISTS mal_sale_yard_species_sub_code_lu   CASCADE;
DROP TABLE IF EXISTS mal_city_lu                         CASCADE;

DROP TABLE IF EXISTS mal_dairy_quality_assurance         CASCADE;
DROP TABLE IF EXISTS mal_dairy_farm_tank                 CASCADE;
DROP TABLE IF EXISTS mal_fur_farm_inventory              CASCADE;
DROP TABLE IF EXISTS mal_game_farm_inventory             CASCADE;
DROP TABLE IF EXISTS mal_licence_comment                 CASCADE;
DROP TABLE IF EXISTS mal_licence_registrant_xref         CASCADE;
DROP TABLE IF EXISTS mal_registrant                      CASCADE;
DROP TABLE IF EXISTS mal_site                            CASCADE;
DROP TABLE IF EXISTS mal_licence                         CASCADE;

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
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_tank ADD PRIMARY KEY (id);
CREATE INDEX mal_dryfrmtnk_site_id_idx on mal_dairy_farm_tank using btree (site_id);
CREATE INDEX mal_dryfrmtnk_serial_number_idx on mal_dairy_farm_tank using btree (serial_number);

--
-- TABLE:  MAL_FUR_FARM_INVENTORY
--

CREATE TABLE mal_fur_farm_inventory (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	fur_farm_species_code_id integer NOT NULL,
	fur_farm_species_sub_code_id integer NOT NULL,
	recorded_date timestamp NOT NULL,
	recorded_value double precision NOT NULL,
	old_identifier varchar(100),
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_fur_farm_inventory ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_furfrminv_uidx ON mal_fur_farm_inventory (licence_id, fur_farm_species_code_id, fur_farm_species_sub_code_id, recorded_date);
ALTER TABLE mal_fur_farm_inventory ADD CONSTRAINT inv_furfrminv_uk UNIQUE USING INDEX inv_furfrminv_uidx;
CREATE INDEX mal_furfrminv_licence_id_idx ON mal_fur_farm_inventory (licence_id);
CREATE INDEX mal_furfrminv_fur_farm_species_code_id_idx ON mal_fur_farm_inventory (fur_farm_species_code_id);
CREATE INDEX mal_furfrminv_fur_farm_species_sub_code_id_idx ON mal_fur_farm_inventory (fur_farm_species_sub_code_id);

--
-- TABLE:  MAL_GAME_FARM_INVENTORY
--

CREATE TABLE mal_game_farm_inventory (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	game_farm_species_code_id integer NOT NULL,
	game_farm_species_sub_code_id integer NOT NULL,
	add_reason_code_id integer NULL, 
	delete_reason_code_id integer NULL, 
	recorded_date timestamp NOT NULL,
	recorded_value double precision NOT NULL,	
	tag_number varchar(10) NULL,
	abattoir varchar(20) NULL,
	buyer_seller  varchar(50) NULL,	
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
COMMENT ON COLUMN mal_game_farm_inventory.tag_number IS E'The unique number of the tag for this animal.';
ALTER TABLE mal_game_farm_inventory ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_gamfrminv_uidx ON mal_game_farm_inventory (licence_id, game_farm_species_code_id, game_farm_species_sub_code_id, recorded_date, tag_number);
ALTER TABLE mal_game_farm_inventory ADD CONSTRAINT inv_gamfrminv_uk UNIQUE USING INDEX inv_gamfrminv_uidx;
CREATE INDEX mal_gamfrminv_licence_id_idx ON mal_game_farm_inventory (licence_id);
CREATE INDEX mal_gamfrminv_game_farm_species_code_id_idx ON mal_game_farm_inventory (game_farm_species_code_id);
CREATE INDEX mal_gamfrminv_species_game_farm_species_sub_code_id_idx ON mal_game_farm_inventory (game_farm_species_sub_code_id);

--
-- TABLE:  MAL_LICENCE
--

CREATE TABLE mal_licence (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_number integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_type_id integer NOT NULL,
	primary_registrant_id integer,
	region_id integer,
	regional_district_id integer, 
	status_code_id integer NOT NULL,
	plant_code_id integer,
	application_date date,
	issue_date date,
	expiry_date date,
	reissue_date date,
	print_certificate boolean,
	print_renewal boolean,
	fee_collected numeric(10,2),
	fee_collected_ind boolean NOT NULL DEFAULT false,
	associated_business_name varchar(100),
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
	bond_carrier_phone_number varchar(10),
	bond_number varchar(50),
	bond_value numeric(10,2),
	bond_carrier_name varchar(50),
	bond_continuation_expiry_date date,
	action_required boolean,
	licence_details varchar(2000),
	dpl_approved_date date,
	dpl_received_date date,
	exam_date date,
	exam_fee numeric(10,2),
	irma_number varchar(10),
	former_irma_number varchar(10),
	dairy_levy numeric(38),
	df_active_ind boolean,
	hives_per_apiary integer,
	total_hives integer,
	psyo_ld_licence_id integer,
	psyo_ld_dealer_name varchar(50),
	lda_ld_licence_id integer,
	lda_ld_dealer_name varchar(50),
	yrd_psyo_licence_id integer,
	yrd_psyo_business_name varchar(50),
	old_identifier varchar(100),
	legacy_game_farm_species_code varchar(10),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence ADD PRIMARY KEY (id);
CREATE INDEX mal_lic_irma_number_idx          on mal_licence using btree (irma_number);
CREATE INDEX mal_lic_licence_type_id_idx      on mal_licence using btree (licence_type_id);
CREATE INDEX mal_lic_plant_code_idx           on mal_licence using btree (plant_code_id);
CREATE INDEX mal_lic_print_certificate_idx    on mal_licence using btree (print_certificate);
CREATE INDEX mal_lic_region_id_idx            on mal_licence using btree (region_id);
CREATE INDEX mal_lic_regional_district_id_idx on mal_licence using btree (regional_district_id);
CREATE INDEX mal_lic_status_code_id_idx       on mal_licence using btree (status_code_id);

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
CREATE INDEX mal_licregxref_licence_id_idx on mal_licence_registrant_xref using btree (licence_id);
CREATE INDEX mal_licregxref_registrant_id_idx on mal_licence_registrant_xref using btree (registrant_id);

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
	company_name varchar(200),
	company_name_override boolean,
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
CREATE INDEX mal_rgst_company_name_idx on mal_registrant using btree (company_name);

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
	dairy_farm_species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_dairy_farm_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_dfssc_id_code_uk on mal_dairy_farm_species_sub_code_lu using btree (dairy_farm_species_code_id, code_name);
	
--
-- TABLE:  MAL_FUR_FARM_SPECIES_CODE_LU
--

CREATE TABLE mal_fur_farm_species_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_fur_farm_species_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_ffsc_code_name_uk on mal_fur_farm_species_code_lu using btree (code_name);
	
--
-- TABLE:  MAL_FUR_FARM_SPECIES_SUB_CODE_LU
--

CREATE TABLE mal_fur_farm_species_sub_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	fur_farm_species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_fur_farm_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_ffssc_id_code_uk on mal_fur_farm_species_sub_code_lu using btree (fur_farm_species_code_id, code_name);

--
-- TABLE:  MAL_GAME_FARM_SPECIES_CODE_LU
--

CREATE TABLE mal_game_farm_species_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_game_farm_species_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_gfsc_uk on mal_game_farm_species_code_lu using btree (code_name);

--
-- TABLE:  MAL_GAME_FARM_SPECIES_SUB_CODE_LU
--

CREATE TABLE mal_game_farm_species_sub_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	game_farm_species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_game_farm_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_gfssc_id_code_uk on mal_game_farm_species_sub_code_lu using btree (game_farm_species_code_id, code_name);
	
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
	sale_yard_species_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_sale_yard_species_sub_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_syssc_id_code_uk on mal_sale_yard_species_sub_code_lu using btree (sale_yard_species_code_id, code_name);

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
