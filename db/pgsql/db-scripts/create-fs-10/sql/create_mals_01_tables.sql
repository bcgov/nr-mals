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

DROP TABLE IF EXISTS mal_inventory_fur_farm              CASCADE;
DROP TABLE IF EXISTS mal_inventory_game_farm             CASCADE;
DROP TABLE IF EXISTS mal_licence_comment                 CASCADE;
DROP TABLE IF EXISTS mal_licence_registrant_xref         CASCADE;
DROP TABLE IF EXISTS mal_registrant                      CASCADE;
DROP TABLE IF EXISTS mal_site                            CASCADE;
DROP TABLE IF EXISTS mal_licence                         CASCADE;

DROP TABLE IF EXISTS mal_add_reason_code_lu              CASCADE;
DROP TABLE IF EXISTS mal_delete_reason_code_lu           CASCADE;
DROP TABLE IF EXISTS mal_licence_type_lu                 CASCADE;
DROP TABLE IF EXISTS mal_plant_code_lu                   CASCADE;
DROP TABLE IF EXISTS mal_regional_district_lu            CASCADE;
DROP TABLE IF EXISTS mal_region_lu                       CASCADE;
DROP TABLE IF EXISTS mal_status_code_lu                  CASCADE;
DROP TABLE IF EXISTS mal_species_dairy_inventory_code_lu CASCADE;
DROP TABLE IF EXISTS mal_species_dairy_code_lu           CASCADE;
DROP TABLE IF EXISTS mal_species_fur_inventory_code_lu   CASCADE;
DROP TABLE IF EXISTS mal_species_fur_code_lu             CASCADE;
DROP TABLE IF EXISTS mal_species_game_inventory_code_lu  CASCADE;
DROP TABLE IF EXISTS mal_species_game_code_lu            CASCADE;
DROP TABLE IF EXISTS mal_species_sale_inventory_code_lu  CASCADE;
DROP TABLE IF EXISTS mal_species_sale_code_lu            CASCADE;


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
-- TABLE:  MAL_INVENTORY_FUR_FARM
--

CREATE TABLE mal_inventory_fur_farm (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	species_fur_code_id integer NOT NULL,
	species_fur_inventory_code_id integer NOT NULL,
	recorded_date timestamp NOT NULL,
	recorded_value double precision NOT NULL,
	old_identifier varchar(100),
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_inventory_fur_farm ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_invfurfrm_uidx ON mal_inventory_fur_farm (licence_id, species_fur_code_id, species_fur_inventory_code_id, recorded_date);
ALTER TABLE mal_inventory_fur_farm ADD CONSTRAINT inv_invfurfrm_uk UNIQUE USING INDEX inv_invfurfrm_uidx;
CREATE INDEX mal_invfurfrm_licence_id_idx ON mal_inventory_fur_farm (licence_id);
CREATE INDEX mal_invfurfrm_species_fur_code_id_idx ON mal_inventory_fur_farm (species_fur_code_id);
CREATE INDEX mal_invfurfrm_species_fur_inventory_code_id_idx ON mal_inventory_fur_farm (species_fur_inventory_code_id);

--
-- TABLE:  MAL_INVENTORY_GAME_FARM
--

CREATE TABLE mal_inventory_game_farm (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	species_game_code_id integer NOT NULL,
	species_game_inventory_code_id integer NOT NULL,
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
COMMENT ON COLUMN mal_inventory_game_farm.tag_number IS E'The unique number of the tag for this animal.';
ALTER TABLE mal_inventory_game_farm ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX inv_invgamfrm_uidx ON mal_inventory_game_farm (licence_id, species_game_code_id, species_game_inventory_code_id, recorded_date, tag_number);
ALTER TABLE mal_inventory_game_farm ADD CONSTRAINT inv_invgamfrm_uk UNIQUE USING INDEX inv_invgamfrm_uidx;
CREATE INDEX mal_invgamfrm_licence_id_idx ON mal_inventory_game_farm (licence_id);
CREATE INDEX mal_invgamfrm_species_game_code_id_idx ON mal_inventory_game_farm (species_game_code_id);
CREATE INDEX mal_invgamfrm_species_game_inventory_code_id_idx ON mal_inventory_game_farm (species_game_inventory_code_id);

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
	species_game_code_id integer,
	application_date date,
	issue_date date,
	expiry_date date,
	reissue_date date,
	print_certificate boolean,
	fee_collected numeric(10,2),
	fee_collected_ind boolean NOT NULL DEFAULT false,
    old_identifier varchar(100),
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
	bond_carrier_phone_number varchar(10),
	bond_number varchar(50),
	bond_value numeric(10,2),
	bond_carrier_name varchar(50),
	bond_continuation_expiry_date date,
	action_required boolean,
	licence_prn_requested boolean,
	renewal_prn_requested boolean,
	recheck_prn_requested boolean,
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
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_licence ADD PRIMARY KEY (id);
CREATE INDEX mal_lic_irma_number_idx          on mal_licence using btree (irma_number);
CREATE INDEX mal_lic_licence_type_id_idx      on mal_licence using btree (licence_type_id);
CREATE INDEX mal_lic_plant_code_idx           on mal_licence using btree (plant_code_id);
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
	licence_id integer,
	first_name varchar(200),
	last_name varchar(200),
	middle_initials varchar(3),
	official_title varchar(200),
	company_name varchar(200),
	client_name varchar(50),
	primary_phone varchar(10),
	cell_number varchar(10),
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
	hive_count integer,
	contact_name varchar(50),
	primary_phone varchar(10),
	cell_number varchar(10),
	fax_number varchar(10),
	address_line_1 varchar(100),
	address_line_2 varchar(100),
	city varchar(35),
	province varchar(4),
	postal_code varchar(6),
	gps_coordinates varchar(50),
	legal_description varchar(2000),
	site_details varchar(2000),
	parcel_identifier varchar(2000),
	old_identifier varchar(100),
	tank_calibration_date timestamp,
	tank_issue_date timestamp,
	tank_company varchar(100),
	tank_serial_number varchar(30),
	tank_model varchar(30),
	tank_capacity varchar(30),
	recheck_year timestamp,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_site ADD PRIMARY KEY (id);
CREATE INDEX mal_site_license_id_idx on mal_site using btree (licence_id);
CREATE INDEX mal_site_contact_name_idx on mal_site using btree (contact_name);

--
-- TABLE:  MAL_SPECIES_DAIRY_CODE_LU
--

CREATE TABLE mal_species_dairy_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_dairy_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcdrycd_code_name_uk on mal_species_dairy_code_lu using btree (code_name);
	
--
-- TABLE:  MAL_SPECIES_DAIRY_INVENTORY_CODE_LU
--

CREATE TABLE mal_species_dairy_inventory_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_dairy_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_dairy_inventory_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcdryinvcd_id_code_uk on mal_species_dairy_inventory_code_lu using btree (species_dairy_code_id, code_name);
	
--
-- TABLE:  MAL_SPECIES_FUR_CODE_LU
--

CREATE TABLE mal_species_fur_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_fur_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcfurcd_code_name_uk on mal_species_fur_code_lu using btree (code_name);
	
--
-- TABLE:  MAL_SPECIES_FUR_INVENTORY_CODE_LU
--

CREATE TABLE mal_species_fur_inventory_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_fur_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_fur_inventory_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcfurinvcd_id_code_uk on mal_species_fur_inventory_code_lu using btree (species_fur_code_id, code_name);

--
-- TABLE:  MAL_SPECIES_GAME_CODE_LU
--

CREATE TABLE mal_species_game_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_game_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcgamcd_uk on mal_species_game_code_lu using btree (code_name);

--
-- TABLE:  MAL_SPECIES_GAME_INVENTORY_CODE_LU
--

CREATE TABLE mal_species_game_inventory_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_game_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_game_inventory_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcgaminvcd_id_code_uk on mal_species_game_inventory_code_lu using btree (species_game_code_id, code_name);
	
--
-- TABLE:  MAL_SPECIES_SALE_CODE_LU
--

CREATE TABLE mal_species_sale_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_sale_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcsalcd_code_name_uk on mal_species_sale_code_lu using btree (code_name);
	
--
-- TABLE:  MAL_SPECIES_SALE_INVENTORY_CODE_LU
--

CREATE TABLE mal_species_sale_inventory_code_lu (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	species_sale_code_id integer NOT null,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag boolean NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_species_sale_inventory_code_lu ADD PRIMARY KEY (id);
CREATE UNIQUE INDEX mal_spcsalinvcd_id_code_uk on mal_species_sale_inventory_code_lu using btree (species_sale_code_id, code_name);

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
