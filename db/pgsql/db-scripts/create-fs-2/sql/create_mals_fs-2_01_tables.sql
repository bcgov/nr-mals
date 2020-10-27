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

CREATE TABLE mal_licence (
	id integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_number integer generated always as identity (start with 60000 increment by 1) NOT NULL,
	licence_type_id integer NOT NULL,
	person_id integer,
	region_id integer,
	regional_district_id integer, 
	status_code_id integer NOT NULL,
	plant_code_id integer,
	species_game_code_id integer,
	application_date date,
	issue_date date,
	expiry_date date,
	fee_collected numeric(10,2),
	fee_collected_ind boolean NOT NULL DEFAULT false,
	bond_carrier_phone_number varchar(10),
	bond_number varchar(50),
	bond_value numeric(10,2),
	bond_carrier_name varchar(50),
	bond_continuation_expiry_date date,
	action_required boolean,
	licence_prn_requested boolean,
	renewal_prn_requested boolean,
	recheck_prn_requested boolean,
	details varchar(2000),
	dpl_approved_date date,
	dpl_received_date date,
	exam_date date,
	exam_fee numeric(10,2),
	irma_number varchar(10),
	former_irma_number varchar(10),
	dairy_levy numeric(38),
	df_active_ind boolean,
	total_hives integer,
	psyo_ld_licence_id integer,
	psyo_ld_dealer_name varchar(50),
	lda_ld_licence_id integer,
	lda_ld_dealer_name varchar(50),
	yrd_psyo_licence_id integer,
	yrd_psyo_business_name varchar(50),
	old_identifier varchar(100),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_LICENCE_COMMENT
--

CREATE TABLE mal_licence_comment (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	licence_comment varchar(4000) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_LICENCE_REGISTRANT_XREF
--

CREATE TABLE mal_licence_registrant_xref (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	licence_id integer NOT NULL,
	registrant_id integer NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_LICENCE_TYPE_LU
--

CREATE TABLE mal_licence_type_lu (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	licence_name varchar(50) UNIQUE NOT NULL,
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

--
-- TABLE:  MAL_PLANT_CODE_LU
--

CREATE TABLE mal_plant_code_lu (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_REGION_LU
--

CREATE TABLE mal_region_lu (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	region_number varchar(50) NOT NULL,
	region_name varchar(200) UNIQUE NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_REGIONAL_DISTRICT_LU
--

CREATE TABLE mal_regional_district_lu (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	region_id integer NOT NULL,
	district_number varchar(50) NOT NULL,
	district_name varchar(200) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_REGISTRANT
--

CREATE TABLE mal_registrant (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	first_name varchar(200),
	last_name varchar(200),
	middle_initials varchar(3),
	official_title varchar(200),
	company_name varchar(200),
	primary_phone varchar(10),
	email_address varchar(128),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_SPECIES_GAME_CODE_LU
--

CREATE TABLE mal_species_game_code_lu (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

--
-- TABLE:  MAL_STATUS_CODE_LU
--

CREATE TABLE mal_status_code_lu (
	id integer generated always as identity (start with 60000increment by 1) NOT NULL,
	code_name varchar(50) UNIQUE NOT NULL,
	code_description varchar(120) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;

