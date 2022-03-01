SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'mals_app', true);
SET check_function_bodies = false;
SET client_min_messages = warning;	
	
--
-- Set defaults for Booleans as they are not populated by the Premises data load.
--
 
ALTER TABLE mal_licence ALTER COLUMN action_required        SET DEFAULT false;
ALTER TABLE mal_licence ALTER COLUMN print_certificate      SET DEFAULT false;
ALTER TABLE mal_licence ALTER COLUMN print_renewal          SET DEFAULT false;
ALTER TABLE mal_licence ALTER COLUMN print_dairy_infraction SET DEFAULT false;

--
-- Add the Premises ID column to the Site table.
--

ALTER TABLE mal_site DROP COLUMN IF EXISTS premises_id;
ALTER TABLE mal_site ADD COLUMN premises_id varchar(24);

--
-- DROP:  TABLES, if not the first deployment.
--

DROP TABLE IF EXISTS mal_premises_detail   CASCADE;
DROP TABLE IF EXISTS mal_premises_job      CASCADE;

--
-- TABLE:  MAL_PREMISES_JOB
--
CREATE TABLE mal_premises_job (
	id integer generated always as identity (start with 1 increment by 1) NOT NULL,	
	job_status varchar(50) NOT NULL,
	execution_start_time timestamp NOT NULL,
	execution_end_time timestamp,
	source_row_count integer,
	source_insert_count integer,
	source_update_count integer,
	source_do_not_import_count integer,
	target_insert_count integer,
	target_update_count integer,
	execution_comment varchar(2000),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_premises_job ADD PRIMARY KEY (id);

--
-- TABLE:  MAL_PREMISES_DETAIL
--
CREATE TABLE mal_premises_detail (
	id integer generated always as identity (start with 1 increment by 1) NOT NULL,
	premises_job_id integer NOT NULL,
	--
	source_operation_pk integer,
	source_last_change_date varchar(30),
	source_premises_id varchar(24),
	import_action varchar(20),
	import_status varchar(20)  default 'PENDING' NOT NULL,
	--
	licence_id integer,	
	licence_number integer,
	licence_action varchar(20),
	licence_status varchar(20),
	licence_status_timestamp timestamp,
	licence_company_name varchar(200),
	licence_hives_per_apiary integer,
	licence_mail_address_line_1 varchar(100),
	licence_mail_address_line_2 varchar(100),
	licence_mail_city varchar(35),
	licence_mail_province varchar(4),
	licence_mail_postal_code varchar(6),
	--
	site_id integer,
	apiary_site_id integer,
	site_action varchar(20),
	site_status varchar(20),
	site_status_timestamp timestamp,
	site_address_line_1 varchar(100),
	site_region_name varchar(200),
	site_regional_district_name varchar(200),
	--
	registrant_id integer,
	registrant_action varchar(20),
	registrant_status varchar(20),
	registrant_status_timestamp timestamp,
	registrant_first_name varchar(200),
	registrant_last_name varchar(200),
	registrant_primary_phone varchar(10),
	registrant_secondary_phone varchar(10),
	registrant_fax_number varchar(10),
	registrant_email_address varchar(128),
	--
	process_comments varchar(2000),
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL
) ;
ALTER TABLE mal_premises_detail ADD PRIMARY KEY (id);
