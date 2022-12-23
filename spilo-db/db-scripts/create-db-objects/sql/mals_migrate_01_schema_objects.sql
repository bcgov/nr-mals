
SET search_path TO mals_app;

CREATE OR REPLACE FUNCTION mals_app.fn_update_audit_columns()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
	begin
	if TG_OP = 'UPDATE' then
		NEW.update_userid     = coalesce(NEW.update_userid, current_user);
		NEW.update_timestamp  = current_timestamp;
	elsif TG_OP = 'INSERT' then
		NEW.create_userid     = coalesce(NEW.create_userid, current_user);
		NEW.create_timestamp  = current_timestamp;
		NEW.update_userid     = coalesce(NEW.update_userid, current_user);
		NEW.update_timestamp  = current_timestamp;
	end if;
	return NEW;
	end;
$function$
;

-- Permissions

ALTER FUNCTION mals_app.fn_update_audit_columns() OWNER TO mals;
GRANT ALL ON FUNCTION mals_app.fn_update_audit_columns() TO mals;

-- mals_app.mal_add_reason_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_add_reason_code_lu;

CREATE TABLE mals_app.mal_add_reason_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_add_reason_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_add_reason_code_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_arcd_code_name_uk ON mals_app.mal_add_reason_code_lu USING btree (code_name);
COMMENT ON TABLE mals_app.mal_add_reason_code_lu IS 'Reasons for additions to the Garm Farm Inventory.';

-- Table Triggers

create trigger mal_trg_add_reason_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_add_reason_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_add_reason_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_add_reason_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_add_reason_code_lu TO mals_app_role;


-- mals_app.mal_apiary_inspection definition

-- Drop table

-- DROP TABLE mals_app.mal_apiary_inspection;

CREATE TABLE mals_app.mal_apiary_inspection (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	site_id int4 NOT NULL,
	inspection_date timestamp NOT NULL,
	inspector_id varchar(10) NULL,
	colonies_tested int4 NULL,
	brood_tested int4 NULL,
	varroa_tested int4 NULL,
	small_hive_beetle_tested int4 NULL,
	american_foulbrood_result int4 NULL,
	european_foulbrood_result int4 NULL,
	small_hive_beetle_result int4 NULL,
	chalkbrood_result int4 NULL,
	sacbrood_result int4 NULL,
	nosema_result int4 NULL,
	varroa_mite_result int4 NULL,
	varroa_mite_result_percent numeric(5, 2) NULL,
	other_result_description varchar(240) NULL,
	supers_inspected int4 NULL,
	supers_destroyed int4 NULL,
	inspection_comment varchar(2000) NULL,
	old_identifier varchar(100) NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_apiary_inspection_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_apiary_inspection IS 'Inspections are recorded at the site level.';

-- Table Triggers

create trigger mal_trg_apiary_inspection_biu before
insert
    or
update
    on
    mals_app.mal_apiary_inspection for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_apiary_inspection OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_apiary_inspection TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_apiary_inspection TO mals_app_role;


-- mals_app.mal_application_role definition

-- Drop table

-- DROP TABLE mals_app.mal_application_role;

CREATE TABLE mals_app.mal_application_role (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	role_name varchar(50) NOT NULL,
	role_description varchar(120) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_application_role_pkey PRIMARY KEY (id),
	CONSTRAINT mal_application_role_role_name_key UNIQUE (role_name)
);
CREATE UNIQUE INDEX mal_apprl_code_name_uk ON mals_app.mal_application_role USING btree (role_name);
COMMENT ON TABLE mals_app.mal_application_role IS 'Used by the application to define authourization.';

-- Table Triggers

create trigger mal_trg_application_role_biu before
insert
    or
update
    on
    mals_app.mal_application_role for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_application_role OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_application_role TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_application_role TO mals_app_role;


-- mals_app.mal_city_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_city_lu;

CREATE TABLE mals_app.mal_city_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	city_name varchar(50) NOT NULL,
	city_description varchar(120) NOT NULL,
	province_code varchar(2) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_city_lu_city_name_key UNIQUE (city_name),
	CONSTRAINT mal_city_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mcl_city_name_province_code_uk ON mals_app.mal_city_lu USING btree (city_name, province_code);
COMMENT ON TABLE mals_app.mal_city_lu IS 'The City list will be used by the app, though the end users may enter their own City values. There exist no foreign keys to this table.';

-- Table Triggers

create trigger mal_trg_city_lu_biu before
insert
    or
update
    on
    mals_app.mal_city_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_city_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_city_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_city_lu TO mals_app_role;


-- mals_app.mal_dairy_farm_species_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_species_code_lu;

CREATE TABLE mals_app.mal_dairy_farm_species_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_species_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_dairy_farm_species_code_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_dfsc_code_name_uk ON mals_app.mal_dairy_farm_species_code_lu USING btree (code_name);
COMMENT ON TABLE mals_app.mal_dairy_farm_species_code_lu IS 'This table is not used as only FRMQA tests are recorded since 2013.';

-- Table Triggers

create trigger mal_trg_dairy_farm_species_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_species_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_species_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_species_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_species_code_lu TO mals_app_role;


-- mals_app.mal_dairy_farm_test_infraction_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_test_infraction_lu;

CREATE TABLE mals_app.mal_dairy_farm_test_infraction_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	test_threshold_id int4 NOT NULL,
	previous_infractions_count int4 NOT NULL,
	levy_percentage int4 NULL,
	correspondence_code varchar(50) NOT NULL,
	correspondence_description varchar(120) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_test_infraction_lu_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_dairy_farm_test_infraction_lu IS 'The actions to take when an infraction occurs.';

-- Table Triggers

create trigger mal_trg_dairy_farm_test_infraction_lu_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_test_infraction_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_test_infraction_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_test_infraction_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_test_infraction_lu TO mals_app_role;


-- mals_app.mal_dairy_farm_test_job definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_test_job;

CREATE TABLE mals_app.mal_dairy_farm_test_job (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	job_status varchar(50) NOT NULL,
	job_source varchar(30) NOT NULL,
	execution_start_time timestamp NOT NULL,
	execution_end_time timestamp NULL,
	source_row_count int4 NULL,
	target_insert_count int4 NULL,
	target_update_count int4 NULL,
	execution_comment varchar(2000) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_test_job_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_dairy_farm_test_job IS 'Batch job summary for loading the CSV data.';

-- Table Triggers

create trigger mal_trg_dairy_farm_test_job_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_test_job for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_test_job OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_test_job TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_test_job TO mals_app_role;


-- mals_app.mal_dairy_farm_test_threshold_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_test_threshold_lu;

CREATE TABLE mals_app.mal_dairy_farm_test_threshold_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	species_code varchar(50) NOT NULL,
	species_sub_code varchar(50) NOT NULL,
	upper_limit numeric(8, 2) NOT NULL,
	infraction_window varchar(30) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_test_threshold_lu_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_dairy_farm_test_threshold_lu IS 'The threshold at which infractions are determined.';

-- Table Triggers

create trigger mal_trg_dairy_farm_test_threshold_lu_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_test_threshold_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_test_threshold_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_test_threshold_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_test_threshold_lu TO mals_app_role;


-- mals_app.mal_delete_reason_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_delete_reason_code_lu;

CREATE TABLE mals_app.mal_delete_reason_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_delete_reason_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_delete_reason_code_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_drcd_code_name_uk ON mals_app.mal_delete_reason_code_lu USING btree (code_name);
COMMENT ON TABLE mals_app.mal_delete_reason_code_lu IS 'Reasons for additions to the Garm Farm Inventory.';

-- Table Triggers

create trigger mal_trg_delete_reason_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_delete_reason_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_delete_reason_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_delete_reason_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_delete_reason_code_lu TO mals_app_role;


-- mals_app.mal_licence_type_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_type_lu;

CREATE TABLE mals_app.mal_licence_type_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_type varchar(50) NOT NULL,
	standard_fee numeric(10, 2) NOT NULL,
	licence_term int4 NOT NULL,
	standard_issue_date timestamp NULL,
	standard_expiry_date timestamp NULL,
	renewal_notice int2 NULL,
	active_flag bool NOT NULL,
	legislation varchar(2000) NOT NULL,
	regulation varchar(2000) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_type_lu_licence_type_key UNIQUE (licence_type),
	CONSTRAINT mal_licence_type_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_lictyp_licence_name_uk ON mals_app.mal_licence_type_lu USING btree (licence_type, standard_issue_date);
COMMENT ON TABLE mals_app.mal_licence_type_lu IS 'Much of the application functionality is based on the Licence Type.';

-- Table Triggers

create trigger mal_trg_licence_type_lu_biu before
insert
    or
update
    on
    mals_app.mal_licence_type_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_type_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_type_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_type_lu TO mals_app_role;


-- mals_app.mal_plant_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_plant_code_lu;

CREATE TABLE mals_app.mal_plant_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_plant_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_plant_code_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_plntcd_code_name_uk ON mals_app.mal_plant_code_lu USING btree (code_name);
COMMENT ON TABLE mals_app.mal_plant_code_lu IS 'Dairy Farm plant codes.';

-- Table Triggers

create trigger mal_trg_plant_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_plant_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_plant_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_plant_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_plant_code_lu TO mals_app_role;


-- mals_app.mal_premises_job definition

-- Drop table

-- DROP TABLE mals_app.mal_premises_job;

CREATE TABLE mals_app.mal_premises_job (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	job_status varchar(50) NOT NULL,
	execution_start_time timestamp NOT NULL,
	execution_end_time timestamp NULL,
	source_row_count int4 NULL,
	source_insert_count int4 NULL,
	source_update_count int4 NULL,
	source_do_not_import_count int4 NULL,
	target_insert_count int4 NULL,
	target_update_count int4 NULL,
	execution_comment varchar(2000) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_premises_job_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_premises_job IS 'Batch job details for loading the file data.';

-- Table Triggers

create trigger mal_trg_premises_job_biu before
insert
    or
update
    on
    mals_app.mal_premises_job for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_premises_job OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_premises_job TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_premises_job TO mals_app_role;


-- mals_app.mal_print_job definition

-- Drop table

-- DROP TABLE mals_app.mal_print_job;

CREATE TABLE mals_app.mal_print_job (
	id int4 NOT NULL GENERATED BY DEFAULT AS IDENTITY,
	print_job_number int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	job_status varchar(30) NULL,
	print_category varchar(100) NOT NULL,
	execution_start_time timestamp NOT NULL,
	json_end_time timestamp NULL,
	document_end_time timestamp NULL,
	certificate_json_count int4 NULL DEFAULT 0,
	envelope_json_count int4 NULL DEFAULT 0,
	card_json_count int4 NULL DEFAULT 0,
	renewal_json_count int4 NULL DEFAULT 0,
	dairy_infraction_json_count int4 NULL DEFAULT 0,
	recheck_notice_json_count int4 NULL DEFAULT 0,
	report_json_count int4 NULL DEFAULT 0,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_print_job_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_print_job IS 'Batch job summary for Certificate, Renewal and Report runs.';

-- Table Triggers

create trigger mal_trg_print_job_biu before
insert
    or
update
    on
    mals_app.mal_print_job for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_print_job OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_job TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_print_job TO mals_app_role;


-- mals_app.mal_print_job_output definition

-- Drop table

-- DROP TABLE mals_app.mal_print_job_output;

CREATE TABLE mals_app.mal_print_job_output (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	print_job_id int4 NOT NULL,
	licence_type varchar(100) NULL,
	licence_number varchar(30) NULL,
	document_type varchar(30) NOT NULL,
	document_json json NULL,
	document_binary bytea NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_print_job_output_pkey PRIMARY KEY (id)
);
COMMENT ON TABLE mals_app.mal_print_job_output IS 'Batch job details for Certificate, Renewal and Report runs.';

-- Table Triggers

create trigger mal_trg_print_job_output_biu before
insert
    or
update
    on
    mals_app.mal_print_job_output for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_print_job_output OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_job_output TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_print_job_output TO mals_app_role;


-- mals_app.mal_region_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_region_lu;

CREATE TABLE mals_app.mal_region_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	region_number varchar(50) NOT NULL,
	region_name varchar(200) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_region_lu_pkey PRIMARY KEY (id),
	CONSTRAINT mal_region_lu_region_name_key UNIQUE (region_name)
);
CREATE UNIQUE INDEX mal_reg_region_number_uk ON mals_app.mal_region_lu USING btree (region_number);
COMMENT ON TABLE mals_app.mal_region_lu IS 'BC Regions.';

-- Table Triggers

create trigger mal_trg_region_lu_biu before
insert
    or
update
    on
    mals_app.mal_region_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_region_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_region_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_region_lu TO mals_app_role;


-- mals_app.mal_registrant definition

-- Drop table

-- DROP TABLE mals_app.mal_registrant;

CREATE TABLE mals_app.mal_registrant (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	first_name varchar(200) NULL,
	last_name varchar(200) NULL,
	middle_initials varchar(3) NULL,
	official_title varchar(200) NULL,
	primary_phone varchar(10) NULL,
	secondary_phone varchar(10) NULL,
	fax_number varchar(10) NULL,
	email_address varchar(128) NULL,
	old_identifier varchar(100) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_registrant_pkey PRIMARY KEY (id)
);
CREATE INDEX mal_rgst_last_name_idx ON mals_app.mal_registrant USING btree (last_name);
COMMENT ON TABLE mals_app.mal_registrant IS 'People who hold, or are associated with, Licences.';

-- Table Triggers

create trigger mal_trg_registrant_biu before
insert
    or
update
    on
    mals_app.mal_registrant for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_registrant OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_registrant TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_registrant TO mals_app_role;


-- mals_app.mal_sale_yard_species_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_sale_yard_species_code_lu;

CREATE TABLE mals_app.mal_sale_yard_species_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_sale_yard_species_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_sale_yard_species_code_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_sysc_code_name_uk ON mals_app.mal_sale_yard_species_code_lu USING btree (code_name);
COMMENT ON TABLE mals_app.mal_sale_yard_species_code_lu IS 'Species codes for Sale Yard licences.';

-- Table Triggers

create trigger mal_trg_sale_yard_species_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_sale_yard_species_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_sale_yard_species_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_sale_yard_species_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_sale_yard_species_code_lu TO mals_app_role;


-- mals_app.mal_status_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_status_code_lu;

CREATE TABLE mals_app.mal_status_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_status_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_status_code_lu_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX mal_statcd_code_name_uk ON mals_app.mal_status_code_lu USING btree (code_name);
COMMENT ON TABLE mals_app.mal_status_code_lu IS 'Statuses for Licences and Sites.';

-- Table Triggers

create trigger mal_trg_status_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_status_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_status_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_status_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_status_code_lu TO mals_app_role;


-- mals_app.mal_application_user definition

-- Drop table

-- DROP TABLE mals_app.mal_application_user;

CREATE TABLE mals_app.mal_application_user (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	application_role_id int4 NULL,
	user_name varchar(50) NOT NULL,
	surname varchar(50) NOT NULL,
	given_name_1 varchar(50) NOT NULL,
	given_name_2 varchar(50) NULL,
	given_name_3 varchar(50) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_application_user_pkey PRIMARY KEY (id),
	CONSTRAINT mal_application_user_user_name_key UNIQUE (user_name),
	CONSTRAINT appusr_apprl_fk FOREIGN KEY (application_role_id) REFERENCES mals_app.mal_application_role(id)
);
CREATE UNIQUE INDEX mal_appusr_code_name_uk ON mals_app.mal_application_user USING btree (user_name);
COMMENT ON TABLE mals_app.mal_application_user IS 'Used by the application to define authentication.';

-- Table Triggers

create trigger mal_trg_application_user_biu before
insert
    or
update
    on
    mals_app.mal_application_user for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_application_user OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_application_user TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_application_user TO mals_app_role;


-- mals_app.mal_dairy_farm_species_sub_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_species_sub_code_lu;

CREATE TABLE mals_app.mal_dairy_farm_species_sub_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	species_code_id int4 NOT NULL,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_species_sub_code_lu_pkey PRIMARY KEY (id),
	CONSTRAINT dfssc_dfsc_fk FOREIGN KEY (species_code_id) REFERENCES mals_app.mal_dairy_farm_species_code_lu(id)
);
CREATE UNIQUE INDEX mal_dfssc_id_code_uk ON mals_app.mal_dairy_farm_species_sub_code_lu USING btree (species_code_id, code_name);
COMMENT ON TABLE mals_app.mal_dairy_farm_species_sub_code_lu IS 'This table is not used as only FRMQA tests are recorded since 2013 and the Sub Species are not recorded.';

-- Table Triggers

create trigger mal_trg_dairy_farm_species_sub_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_species_sub_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_species_sub_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_species_sub_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_species_sub_code_lu TO mals_app_role;


-- mals_app.mal_licence_species_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_species_code_lu;

CREATE TABLE mals_app.mal_licence_species_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_type_id int4 NOT NULL,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_species_code_lu_code_name_key UNIQUE (code_name),
	CONSTRAINT mal_licence_species_code_lu_pkey PRIMARY KEY (id),
	CONSTRAINT lsc_lictyp_fk FOREIGN KEY (licence_type_id) REFERENCES mals_app.mal_licence_type_lu(id)
);
CREATE UNIQUE INDEX mal_lsc_code_name_uk ON mals_app.mal_licence_species_code_lu USING btree (licence_type_id, code_name);
COMMENT ON TABLE mals_app.mal_licence_species_code_lu IS 'Species codes for Fur Farm and Game Farm licences.';

-- Table Triggers

create trigger mal_trg_licence_species_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_licence_species_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_species_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_species_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_species_code_lu TO mals_app_role;


-- mals_app.mal_licence_species_sub_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_species_sub_code_lu;

CREATE TABLE mals_app.mal_licence_species_sub_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	species_code_id int4 NOT NULL,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_species_sub_code_lu_pkey PRIMARY KEY (id),
	CONSTRAINT lssc_sc_fk FOREIGN KEY (species_code_id) REFERENCES mals_app.mal_licence_species_code_lu(id)
);
CREATE UNIQUE INDEX mal_lssc_id_code_uk ON mals_app.mal_licence_species_sub_code_lu USING btree (species_code_id, code_name);
COMMENT ON TABLE mals_app.mal_licence_species_sub_code_lu IS 'Species sub codes for Fur Farm and Game Farm licences.';

-- Table Triggers

create trigger mal_trg_licence_species_sub_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_licence_species_sub_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_species_sub_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_species_sub_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_species_sub_code_lu TO mals_app_role;


-- mals_app.mal_licence_type_parent_child_xref definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_type_parent_child_xref;

CREATE TABLE mals_app.mal_licence_type_parent_child_xref (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	parent_licence_type_id int4 NOT NULL,
	child_licence_type_id int4 NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_type_parent_child_xref_pkey PRIMARY KEY (id),
	CONSTRAINT lictypprntchldxref_chldlictyp_fk FOREIGN KEY (child_licence_type_id) REFERENCES mals_app.mal_licence_type_lu(id),
	CONSTRAINT lictypprntchldxref_prntlictyp_fk FOREIGN KEY (parent_licence_type_id) REFERENCES mals_app.mal_licence_type_lu(id)
);
CREATE UNIQUE INDEX mal_lictypprntchld_uk ON mals_app.mal_licence_type_parent_child_xref USING btree (parent_licence_type_id, child_licence_type_id);
COMMENT ON TABLE mals_app.mal_licence_type_parent_child_xref IS 'Cross reference for parent Licence Types and child Licence Types.';

-- Table Triggers

create trigger mal_trg_licence_type_parent_child_xref_biu before
insert
    or
update
    on
    mals_app.mal_licence_type_parent_child_xref for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_type_parent_child_xref OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_type_parent_child_xref TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_type_parent_child_xref TO mals_app_role;


-- mals_app.mal_premises_detail definition

-- Drop table

-- DROP TABLE mals_app.mal_premises_detail;

CREATE TABLE mals_app.mal_premises_detail (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	premises_job_id int4 NOT NULL,
	source_operation_pk int4 NULL,
	source_last_change_date varchar(30) NULL,
	source_premises_id varchar(24) NULL,
	import_action varchar(20) NULL,
	import_status varchar(20) NOT NULL DEFAULT 'PENDING'::character varying,
	licence_id int4 NULL,
	licence_number int4 NULL,
	licence_action varchar(20) NULL,
	licence_status varchar(20) NULL,
	licence_status_timestamp timestamp NULL,
	licence_company_name varchar(200) NULL,
	licence_total_hives int4 NULL,
	licence_mail_address_line_1 varchar(100) NULL,
	licence_mail_address_line_2 varchar(100) NULL,
	licence_mail_city varchar(35) NULL,
	licence_mail_province varchar(4) NULL,
	licence_mail_postal_code varchar(6) NULL,
	site_id int4 NULL,
	apiary_site_id int4 NULL,
	site_action varchar(20) NULL,
	site_status varchar(20) NULL,
	site_status_timestamp timestamp NULL,
	site_address_line_1 varchar(100) NULL,
	site_region_name varchar(200) NULL,
	site_regional_district_name varchar(200) NULL,
	registrant_id int4 NULL,
	registrant_action varchar(20) NULL,
	registrant_status varchar(20) NULL,
	registrant_status_timestamp timestamp NULL,
	registrant_first_name varchar(200) NULL,
	registrant_last_name varchar(200) NULL,
	registrant_primary_phone varchar(10) NULL,
	registrant_secondary_phone varchar(10) NULL,
	registrant_fax_number varchar(10) NULL,
	registrant_email_address varchar(128) NULL,
	process_comments varchar(2000) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_premises_detail_pkey PRIMARY KEY (id),
	CONSTRAINT premdtl_premjob_fk FOREIGN KEY (premises_job_id) REFERENCES mals_app.mal_premises_job(id)
);
COMMENT ON TABLE mals_app.mal_premises_detail IS 'Batch job summary for loading the file data..';

-- Table Triggers

create trigger mal_trg_premises_detail_biu before
insert
    or
update
    on
    mals_app.mal_premises_detail for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_premises_detail OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_premises_detail TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_premises_detail TO mals_app_role;


-- mals_app.mal_regional_district_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_regional_district_lu;

CREATE TABLE mals_app.mal_regional_district_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	region_id int4 NOT NULL,
	district_number varchar(50) NOT NULL,
	district_name varchar(200) NOT NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_regional_district_lu_pkey PRIMARY KEY (id),
	CONSTRAINT regdist_reg_fk FOREIGN KEY (region_id) REFERENCES mals_app.mal_region_lu(id)
);
CREATE UNIQUE INDEX mal_regdist_region_district_uk ON mals_app.mal_regional_district_lu USING btree (region_id, district_number);
COMMENT ON TABLE mals_app.mal_regional_district_lu IS 'BC Districts.';

-- Table Triggers

create trigger mal_trg_regional_district_lu_biu before
insert
    or
update
    on
    mals_app.mal_regional_district_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_regional_district_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_regional_district_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_regional_district_lu TO mals_app_role;


-- mals_app.mal_sale_yard_species_sub_code_lu definition

-- Drop table

-- DROP TABLE mals_app.mal_sale_yard_species_sub_code_lu;

CREATE TABLE mals_app.mal_sale_yard_species_sub_code_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	species_code_id int4 NOT NULL,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_sale_yard_species_sub_code_lu_pkey PRIMARY KEY (id),
	CONSTRAINT syssc_sysc_fk FOREIGN KEY (species_code_id) REFERENCES mals_app.mal_sale_yard_species_code_lu(id)
);
CREATE UNIQUE INDEX mal_syssc_id_code_uk ON mals_app.mal_sale_yard_species_sub_code_lu USING btree (species_code_id, code_name);
COMMENT ON TABLE mals_app.mal_sale_yard_species_sub_code_lu IS 'Species sub codes for Sale Yard licences.';

-- Table Triggers

create trigger mal_trg_sale_yard_species_sub_code_lu_biu before
insert
    or
update
    on
    mals_app.mal_sale_yard_species_sub_code_lu for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_sale_yard_species_sub_code_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_sale_yard_species_sub_code_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_sale_yard_species_sub_code_lu TO mals_app_role;


-- mals_app.mal_licence definition

-- Drop table

-- DROP TABLE mals_app.mal_licence;

CREATE TABLE mals_app.mal_licence (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_number int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	irma_number varchar(10) NULL,
	licence_type_id int4 NOT NULL,
	status_code_id int4 NOT NULL,
	primary_registrant_id int4 NULL,
	region_id int4 NULL,
	regional_district_id int4 NULL,
	plant_code_id int4 NULL,
	species_code_id int4 NULL,
	company_name varchar(200) NULL,
	company_name_override bool NULL,
	address_line_1 varchar(100) NULL,
	address_line_2 varchar(100) NULL,
	city varchar(35) NULL,
	province varchar(4) NULL,
	postal_code varchar(6) NULL,
	country varchar(50) NULL,
	mail_address_line_1 varchar(100) NULL,
	mail_address_line_2 varchar(100) NULL,
	mail_city varchar(35) NULL,
	mail_province varchar(4) NULL,
	mail_postal_code varchar(6) NULL,
	mail_country varchar(50) NULL,
	gps_coordinates varchar(50) NULL,
	primary_phone varchar(10) NULL,
	secondary_phone varchar(10) NULL,
	fax_number varchar(10) NULL,
	application_date date NULL,
	issue_date date NULL,
	expiry_date date NULL,
	reissue_date date NULL,
	fee_collected numeric(10, 2) NULL,
	fee_collected_ind bool NOT NULL DEFAULT false,
	bond_carrier_phone_number varchar(10) NULL,
	bond_number varchar(50) NULL,
	bond_value numeric(10, 2) NULL,
	bond_carrier_name varchar(50) NULL,
	bond_continuation_expiry_date date NULL,
	dpl_approved_date date NULL,
	dpl_received_date date NULL,
	exam_date date NULL,
	exam_fee numeric(10, 2) NULL,
	dairy_levy numeric(38) NULL,
	df_active_ind bool NULL,
	hives_per_apiary int4 NULL,
	total_hives int4 NULL,
	licence_details varchar(2000) NULL,
	former_irma_number varchar(10) NULL,
	old_identifier varchar(100) NULL,
	action_required bool NULL DEFAULT false,
	print_certificate bool NULL DEFAULT false,
	print_renewal bool NULL DEFAULT false,
	print_dairy_infraction bool NULL DEFAULT false,
	legacy_game_farm_species_code varchar(10) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_pkey PRIMARY KEY (id),
	CONSTRAINT lic_lictyp_fk FOREIGN KEY (licence_type_id) REFERENCES mals_app.mal_licence_type_lu(id),
	CONSTRAINT lic_lsc_fk FOREIGN KEY (species_code_id) REFERENCES mals_app.mal_licence_species_code_lu(id),
	CONSTRAINT lic_plnt_fk FOREIGN KEY (plant_code_id) REFERENCES mals_app.mal_plant_code_lu(id),
	CONSTRAINT lic_reg_fk FOREIGN KEY (region_id) REFERENCES mals_app.mal_region_lu(id),
	CONSTRAINT lic_regdist_fk FOREIGN KEY (regional_district_id) REFERENCES mals_app.mal_regional_district_lu(id),
	CONSTRAINT lic_rgst_fk FOREIGN KEY (primary_registrant_id) REFERENCES mals_app.mal_registrant(id),
	CONSTRAINT lic_stat_fk FOREIGN KEY (status_code_id) REFERENCES mals_app.mal_status_code_lu(id)
);
CREATE INDEX mal_lic_company_name_idx ON mals_app.mal_licence USING btree (company_name);
CREATE INDEX mal_lic_irma_number_idx ON mals_app.mal_licence USING btree (irma_number);
CREATE INDEX mal_lic_licence_type_id_idx ON mals_app.mal_licence USING btree (licence_type_id);
CREATE INDEX mal_lic_plant_code_idx ON mals_app.mal_licence USING btree (plant_code_id);
CREATE INDEX mal_lic_print_certificate_idx ON mals_app.mal_licence USING btree (print_certificate);
CREATE INDEX mal_lic_region_id_idx ON mals_app.mal_licence USING btree (region_id);
CREATE INDEX mal_lic_regional_district_id_idx ON mals_app.mal_licence USING btree (regional_district_id);
CREATE INDEX mal_lic_status_code_id_idx ON mals_app.mal_licence USING btree (status_code_id);
COMMENT ON TABLE mals_app.mal_licence IS 'Licences are the central component of the MALS application, around which all other data is modeled.';

-- Table Triggers

create trigger mal_trg_licence_biu before
insert
    or
update
    on
    mals_app.mal_licence for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence TO mals_app_role;


-- mals_app.mal_licence_comment definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_comment;

CREATE TABLE mals_app.mal_licence_comment (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	licence_comment varchar(4000) NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_comment_pkey PRIMARY KEY (id),
	CONSTRAINT liccmnt_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id)
);
CREATE INDEX mal_liccmnt_license_id_idx ON mals_app.mal_licence_comment USING btree (licence_id);
COMMENT ON TABLE mals_app.mal_licence_comment IS 'A Licence may have one or more comments associated with it.';

-- Table Triggers

create trigger mal_trg_licence_comment_biu before
insert
    or
update
    on
    mals_app.mal_licence_comment for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_comment OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_comment TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_comment TO mals_app_role;


-- mals_app.mal_licence_parent_child_xref definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_parent_child_xref;

CREATE TABLE mals_app.mal_licence_parent_child_xref (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	parent_licence_id int4 NOT NULL,
	child_licence_id int4 NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_parent_child_xref_pkey PRIMARY KEY (id),
	CONSTRAINT licprntchldxref_chldlic_fk FOREIGN KEY (child_licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT licprntchldxref_prntlic_fk FOREIGN KEY (parent_licence_id) REFERENCES mals_app.mal_licence(id)
);
CREATE UNIQUE INDEX mal_licprntchld_uk ON mals_app.mal_licence_parent_child_xref USING btree (parent_licence_id, child_licence_id);
COMMENT ON TABLE mals_app.mal_licence_parent_child_xref IS 'Cross reference for parent Licences and child Licences.';

-- Table Triggers

create trigger mal_trg_licence_parent_child_xref_biu before
insert
    or
update
    on
    mals_app.mal_licence_parent_child_xref for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_parent_child_xref OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_parent_child_xref TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_parent_child_xref TO mals_app_role;


-- mals_app.mal_licence_registrant_xref definition

-- Drop table

-- DROP TABLE mals_app.mal_licence_registrant_xref;

CREATE TABLE mals_app.mal_licence_registrant_xref (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	registrant_id int4 NOT NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_licence_registrant_xref_pkey PRIMARY KEY (id),
	CONSTRAINT licrgstxref_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT licrgstxref_rgst_fk FOREIGN KEY (registrant_id) REFERENCES mals_app.mal_registrant(id)
);
CREATE UNIQUE INDEX mal_licregxref_uk ON mals_app.mal_licence_registrant_xref USING btree (licence_id, registrant_id);
COMMENT ON TABLE mals_app.mal_licence_registrant_xref IS 'Cross reference between Licences and non-primary Registrants.';

-- Table Triggers

create trigger mal_trg_licence_registrant_xref_biu before
insert
    or
update
    on
    mals_app.mal_licence_registrant_xref for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_licence_registrant_xref OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_registrant_xref TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_licence_registrant_xref TO mals_app_role;


-- mals_app.mal_sale_yard_inventory definition

-- Drop table

-- DROP TABLE mals_app.mal_sale_yard_inventory;

CREATE TABLE mals_app.mal_sale_yard_inventory (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	species_sub_code_id int4 NULL,
	recorded_date timestamp NOT NULL,
	recorded_value float8 NOT NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT inv_saleyardinv_uk UNIQUE (licence_id, species_sub_code_id, recorded_date),
	CONSTRAINT mal_sale_yard_inventory_pkey PRIMARY KEY (id),
	CONSTRAINT syi_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT syi_syssc_fk FOREIGN KEY (species_sub_code_id) REFERENCES mals_app.mal_sale_yard_species_sub_code_lu(id)
);
CREATE INDEX mal_saleyardinv_licence_id_idx ON mals_app.mal_sale_yard_inventory USING btree (licence_id);
CREATE INDEX mal_saleyardinv_species_sub_code_id_idx ON mals_app.mal_sale_yard_inventory USING btree (species_sub_code_id);
COMMENT ON TABLE mals_app.mal_sale_yard_inventory IS 'Inventory details per Licence, per Species Sub Code.';

-- Table Triggers

create trigger mal_trg_sale_yard_inventory_biu before
insert
    or
update
    on
    mals_app.mal_sale_yard_inventory for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_sale_yard_inventory OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_sale_yard_inventory TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_sale_yard_inventory TO mals_app_role;


-- mals_app.mal_site definition

-- Drop table

-- DROP TABLE mals_app.mal_site;

CREATE TABLE mals_app.mal_site (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	apiary_site_id int4 NULL,
	region_id int4 NULL,
	regional_district_id int4 NULL,
	status_code_id int4 NULL,
	registration_date timestamp NULL,
	deactivation_date timestamp NULL,
	inspector_name varchar(200) NULL,
	inspection_date timestamp NULL,
	next_inspection_date timestamp NULL,
	hive_count int4 NULL,
	contact_name varchar(50) NULL,
	primary_phone varchar(10) NULL,
	secondary_phone varchar(10) NULL,
	fax_number varchar(10) NULL,
	address_line_1 varchar(100) NULL,
	address_line_2 varchar(100) NULL,
	city varchar(35) NULL,
	province varchar(4) NULL,
	postal_code varchar(6) NULL,
	country varchar(50) NULL,
	gps_coordinates varchar(50) NULL,
	legal_description varchar(2000) NULL,
	site_details varchar(2000) NULL,
	parcel_identifier varchar(2000) NULL,
	old_identifier varchar(100) NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	premises_id varchar(24) NULL,
	CONSTRAINT mal_site_pkey PRIMARY KEY (id),
	CONSTRAINT site_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT site_regdist_fk FOREIGN KEY (regional_district_id) REFERENCES mals_app.mal_regional_district_lu(id),
	CONSTRAINT site_stat_fk FOREIGN KEY (status_code_id) REFERENCES mals_app.mal_status_code_lu(id),
	CONSTRAINT sitr_reg_fk FOREIGN KEY (region_id) REFERENCES mals_app.mal_region_lu(id)
);
CREATE INDEX mal_site_contact_name_idx ON mals_app.mal_site USING btree (contact_name);
CREATE INDEX mal_site_license_id_idx ON mals_app.mal_site USING btree (licence_id);
COMMENT ON TABLE mals_app.mal_site IS 'Licences may have one or more sites associated with it.';

-- Table Triggers

create trigger mal_trg_site_biu before
insert
    or
update
    on
    mals_app.mal_site for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_site OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_site TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_site TO mals_app_role;


-- mals_app.mal_dairy_farm_tank definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_tank;

CREATE TABLE mals_app.mal_dairy_farm_tank (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	site_id int4 NOT NULL,
	serial_number varchar(30) NULL,
	calibration_date timestamp NULL,
	issue_date timestamp NULL,
	company_name varchar(100) NULL,
	model_number varchar(30) NULL,
	tank_capacity varchar(30) NULL,
	recheck_year varchar(4) NULL,
	print_recheck_notice bool NULL DEFAULT false,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_tank_pkey PRIMARY KEY (id),
	CONSTRAINT dft_site_fk FOREIGN KEY (site_id) REFERENCES mals_app.mal_site(id)
);
CREATE INDEX mal_dryfrmtnk_serial_number_idx ON mals_app.mal_dairy_farm_tank USING btree (serial_number);
CREATE INDEX mal_dryfrmtnk_site_id_idx ON mals_app.mal_dairy_farm_tank USING btree (site_id);
COMMENT ON TABLE mals_app.mal_dairy_farm_tank IS 'Tank details. Stored in the Site Details column in the previous data model.';

-- Table Triggers

create trigger mal_trg_dairy_farm_tank_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_tank for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_tank OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_tank TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_tank TO mals_app_role;


-- mals_app.mal_dairy_farm_test_result definition

-- Drop table

-- DROP TABLE mals_app.mal_dairy_farm_test_result;

CREATE TABLE mals_app.mal_dairy_farm_test_result (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	test_job_id int4 NOT NULL,
	licence_id int4 NOT NULL,
	irma_number varchar(5) NULL,
	plant_code varchar(2) NULL,
	test_month int4 NULL,
	test_year int4 NULL,
	spc1_day varchar(2) NULL,
	spc1_date date NULL,
	spc1_value numeric(10, 2) NULL,
	spc1_infraction_flag bool NULL,
	spc1_previous_infraction_first_date date NULL,
	spc1_previous_infraction_count int4 NULL,
	spc1_levy_percentage int4 NULL,
	spc1_correspondence_code varchar(50) NULL,
	spc1_correspondence_description varchar(120) NULL,
	scc_day varchar(2) NULL,
	scc_date date NULL,
	scc_value numeric(10, 2) NULL,
	scc_infraction_flag bool NULL,
	scc_previous_infraction_first_date date NULL,
	scc_previous_infraction_count int4 NULL,
	scc_levy_percentage int4 NULL,
	scc_correspondence_code varchar(50) NULL,
	scc_correspondence_description varchar(120) NULL,
	cry_day varchar(2) NULL,
	cry_date date NULL,
	cry_value numeric(10, 2) NULL,
	cry_infraction_flag bool NULL,
	cry_previous_infraction_first_date date NULL,
	cry_previous_infraction_count int4 NULL,
	cry_levy_percentage int4 NULL,
	cry_correspondence_code varchar(50) NULL,
	cry_correspondence_description varchar(120) NULL,
	ffa_day varchar(2) NULL,
	ffa_date date NULL,
	ffa_value numeric(10, 2) NULL,
	ffa_infraction_flag bool NULL,
	ffa_previous_infraction_first_date date NULL,
	ffa_previous_infraction_count int4 NULL,
	ffa_levy_percentage int4 NULL,
	ffa_correspondence_code varchar(50) NULL,
	ffa_correspondence_description varchar(120) NULL,
	ih_day varchar(2) NULL,
	ih_date date NULL,
	ih_value numeric(10, 2) NULL,
	ih_infraction_flag bool NULL,
	ih_previous_infraction_first_date date NULL,
	ih_previous_infraction_count int4 NULL,
	ih_levy_percentage int4 NULL,
	ih_correspondence_code varchar(50) NULL,
	ih_correspondence_description varchar(120) NULL,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_dairy_farm_test_result_pkey PRIMARY KEY (id),
	CONSTRAINT mal_dryfrmtst_irmacry_uk UNIQUE (irma_number, test_year, test_month, cry_day),
	CONSTRAINT mal_dryfrmtst_irmaffa_uk UNIQUE (irma_number, test_year, test_month, ffa_day),
	CONSTRAINT mal_dryfrmtst_irmaih_uk UNIQUE (irma_number, test_year, test_month, ih_day),
	CONSTRAINT mal_dryfrmtst_irmascc_uk UNIQUE (irma_number, test_year, test_month, scc_day),
	CONSTRAINT mal_dryfrmtst_irmaspc1_uk UNIQUE (irma_number, test_year, test_month, spc1_day),
	CONSTRAINT dftr_dftj_fk FOREIGN KEY (test_job_id) REFERENCES mals_app.mal_dairy_farm_test_job(id),
	CONSTRAINT dftr_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id)
);
CREATE INDEX mal_dryfrmtst_test_job_id_idx ON mals_app.mal_dairy_farm_test_result USING btree (test_job_id);
COMMENT ON TABLE mals_app.mal_dairy_farm_test_result IS 'Batch job details for loading the CSV data.';

-- Table Triggers

create trigger mal_trg_dairy_farm_test_result_biu before
insert
    or
update
    on
    mals_app.mal_dairy_farm_test_result for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_test_result OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_test_result TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_dairy_farm_test_result TO mals_app_role;


-- mals_app.mal_fur_farm_inventory definition

-- Drop table

-- DROP TABLE mals_app.mal_fur_farm_inventory;

CREATE TABLE mals_app.mal_fur_farm_inventory (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	species_sub_code_id int4 NOT NULL,
	recorded_date timestamp NOT NULL,
	recorded_value float8 NOT NULL,
	old_identifier varchar(100) NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT inv_furfrminv_uk UNIQUE (licence_id, species_sub_code_id, recorded_date),
	CONSTRAINT mal_fur_farm_inventory_pkey PRIMARY KEY (id),
	CONSTRAINT ffi_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT ffi_lssc_fk FOREIGN KEY (species_sub_code_id) REFERENCES mals_app.mal_licence_species_sub_code_lu(id)
);
CREATE INDEX mal_furfrminv_licence_id_idx ON mals_app.mal_fur_farm_inventory USING btree (licence_id);
CREATE INDEX mal_furfrminv_species_sub_code_id_idx ON mals_app.mal_fur_farm_inventory USING btree (species_sub_code_id);
COMMENT ON TABLE mals_app.mal_fur_farm_inventory IS 'Inventory details per Licence, per Species Sub Code.';

-- Table Triggers

create trigger mal_trg_fur_farm_inventory_biu before
insert
    or
update
    on
    mals_app.mal_fur_farm_inventory for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_fur_farm_inventory OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_fur_farm_inventory TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_fur_farm_inventory TO mals_app_role;


-- mals_app.mal_game_farm_inventory definition

-- Drop table

-- DROP TABLE mals_app.mal_game_farm_inventory;

CREATE TABLE mals_app.mal_game_farm_inventory (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	licence_id int4 NOT NULL,
	species_sub_code_id int4 NOT NULL,
	add_reason_code_id int4 NULL,
	delete_reason_code_id int4 NULL,
	recorded_date timestamp NOT NULL,
	recorded_value float8 NOT NULL,
	tag_number varchar(10) NULL, -- The unique number of the tag for this animal.
	abattoir_value varchar(20) NULL,
	buyer_seller varchar(50) NULL,
	create_userid varchar(30) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(30) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT inv_gamfrminv_uk UNIQUE (licence_id, species_sub_code_id, recorded_date, tag_number),
	CONSTRAINT mal_game_farm_inventory_pkey PRIMARY KEY (id),
	CONSTRAINT gfi_addrsn_fk FOREIGN KEY (add_reason_code_id) REFERENCES mals_app.mal_add_reason_code_lu(id),
	CONSTRAINT gfi_delrsn_fk FOREIGN KEY (delete_reason_code_id) REFERENCES mals_app.mal_delete_reason_code_lu(id),
	CONSTRAINT gfi_lic_fk FOREIGN KEY (licence_id) REFERENCES mals_app.mal_licence(id),
	CONSTRAINT gfi_lssc_fk FOREIGN KEY (species_sub_code_id) REFERENCES mals_app.mal_licence_species_sub_code_lu(id)
);
CREATE INDEX mal_gamfrminv_licence_id_idx ON mals_app.mal_game_farm_inventory USING btree (licence_id);
CREATE INDEX mal_gamfrminv_species_species_sub_code_id_idx ON mals_app.mal_game_farm_inventory USING btree (species_sub_code_id);
COMMENT ON TABLE mals_app.mal_game_farm_inventory IS 'Inventory details per Licence, per Species Sub Code.';

-- Column comments

COMMENT ON COLUMN mals_app.mal_game_farm_inventory.tag_number IS 'The unique number of the tag for this animal.';

-- Table Triggers

create trigger mal_trg_game_farm_inventory_biu before
insert
    or
update
    on
    mals_app.mal_game_farm_inventory for each row execute function mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_game_farm_inventory OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_game_farm_inventory TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_game_farm_inventory TO mals_app_role;


-- mals_app.mal_apiary_inspection_vw source

CREATE OR REPLACE VIEW mals_app.mal_apiary_inspection_vw
AS SELECT insp.id AS apiary_inspection_id,
    lic.id AS licence_id,
    lic.licence_number,
    stat.code_description AS licence_status,
    site.apiary_site_id,
    rgn.region_name,
    reg.last_name,
    reg.first_name,
    insp.inspection_date,
    insp.colonies_tested,
    insp.brood_tested,
    insp.american_foulbrood_result,
    insp.european_foulbrood_result,
    insp.nosema_result,
    insp.chalkbrood_result,
    insp.sacbrood_result,
    insp.varroa_tested,
    insp.varroa_mite_result,
    insp.varroa_mite_result_percent,
    insp.small_hive_beetle_tested,
    insp.small_hive_beetle_result,
    insp.supers_inspected,
    insp.supers_destroyed,
    lic.hives_per_apiary,
    site.hive_count
   FROM mals_app.mal_apiary_inspection insp
     JOIN mals_app.mal_site site ON insp.site_id = site.id
     JOIN mals_app.mal_licence lic ON site.licence_id = lic.id
     JOIN mals_app.mal_status_code_lu stat ON lic.status_code_id = stat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mals_app.mal_region_lu rgn ON site.region_id = rgn.id;

-- Permissions

ALTER TABLE mals_app.mal_apiary_inspection_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_apiary_inspection_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_apiary_inspection_vw TO mals_app_role;


-- mals_app.mal_apiary_producer_vw source

CREATE OR REPLACE VIEW mals_app.mal_apiary_producer_vw
AS SELECT site.id AS site_id,
    lic.id AS licence_id,
    lic.licence_number,
    stat.code_name AS site_status,
    site.apiary_site_id,
    reg.last_name AS registrant_last_name,
    reg.first_name AS registrant_first_name,
    reg.primary_phone AS registrant_primary_phone,
    reg.email_address AS registrant_email_address,
    lic.region_id AS site_region_id,
    rgn.region_name AS site_region_name,
    lic.regional_district_id AS site_regional_district_id,
    dist.district_name AS site_district_name,
    btrim(concat(site.address_line_1, ' ', site.address_line_2)) AS site_address,
    site.city AS site_city,
    site.primary_phone AS site_primary_phone,
    site.registration_date,
    lic.total_hives AS licence_hive_count,
    site.hive_count AS site_hive_count
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_region_lu rgn ON site.region_id = rgn.id
     JOIN mals_app.mal_regional_district_lu dist ON site.regional_district_id = dist.id
     JOIN mals_app.mal_status_code_lu stat ON site.status_code_id = stat.id
  WHERE lictyp.licence_type::text = 'APIARY'::text AND stat.code_name::text = 'ACT'::text;

-- Permissions

ALTER TABLE mals_app.mal_apiary_producer_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_apiary_producer_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_apiary_producer_vw TO mals_app_role;


-- mals_app.mal_dairy_farm_tank_vw source

CREATE OR REPLACE VIEW mals_app.mal_dairy_farm_tank_vw
AS SELECT dft.id AS dairy_farm_tank_id,
    dft.site_id,
    lic.id AS licence_id,
    lic.licence_number,
    lic.irma_number,
    licstat.code_name AS licence_status,
    lic.company_name,
        CASE
            WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name::text
            ELSE NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)
        END AS derived_licence_holder_name,
        CASE
            WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
            ELSE COALESCE(reg.last_name, reg.first_name)
        END AS registrant_last_first,
    btrim(concat(lic.address_line_1, ' ', lic.address_line_2)) AS address,
    lic.city,
    lic.province,
    lic.postal_code,
    reg.primary_phone AS registrant_primary_phone,
    reg.secondary_phone AS registrant_secondary_phone,
    reg.fax_number AS registrant_fax_number,
    reg.email_address AS registrant_email_address,
    lic.issue_date,
    to_char(lic.issue_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS issue_date_display,
    sitestat.code_name AS site_status,
    btrim(concat(site.address_line_1, ' ', site.address_line_2)) AS site_address,
    site.city AS site_city,
    site.province AS site_province,
    site.postal_code AS site_postal_code,
    site.inspector_name,
    site.inspection_date,
    dft.calibration_date,
    to_char(dft.calibration_date, 'FMMonth dd, yyyy'::text) AS calibration_date_display,
    dft.company_name AS tank_company_name,
    dft.model_number AS tank_model_number,
    dft.serial_number AS tank_serial_number,
    dft.tank_capacity,
    dft.recheck_year
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_dairy_farm_tank dft ON site.id = dft.site_id
     JOIN mals_app.mal_status_code_lu sitestat ON lic.status_code_id = sitestat.id;

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_tank_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_tank_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_dairy_farm_tank_vw TO mals_app_role;


-- mals_app.mal_dairy_farm_test_infraction_vw source

CREATE OR REPLACE VIEW mals_app.mal_dairy_farm_test_infraction_vw
AS WITH thresholds AS (
         SELECT mal_dairy_farm_test_threshold_lu.species_sub_code,
            mal_dairy_farm_test_threshold_lu.upper_limit,
            mal_dairy_farm_test_threshold_lu.infraction_window
           FROM mals_app.mal_dairy_farm_test_threshold_lu
          WHERE mal_dairy_farm_test_threshold_lu.species_code::text = 'FRMQA'::text AND mal_dairy_farm_test_threshold_lu.active_flag = true
        ), result1 AS (
         SELECT rslt.id AS test_result_id,
            rslt.test_job_id,
            rslt.irma_number,
                CASE
                    WHEN rslt.spc1_day IS NULL OR rslt.spc1_day::text = ''::text THEN NULL::date
                    ELSE concat(rslt.test_year, '-', rslt.test_month, '-', rslt.spc1_day)::date
                END AS spc1_date,
            spc1_thr.infraction_window AS spc1_infraction_window,
                CASE
                    WHEN rslt.spc1_value > spc1_thr.upper_limit THEN true
                    ELSE false
                END AS spc1_infraction_flag,
                CASE
                    WHEN rslt.scc_day IS NULL OR rslt.scc_day::text = ''::text THEN NULL::date
                    ELSE concat(rslt.test_year, '-', rslt.test_month, '-', rslt.scc_day)::date
                END AS scc_date,
            scc_thr.infraction_window AS scc_infraction_window,
                CASE
                    WHEN rslt.scc_value > scc_thr.upper_limit THEN true
                    ELSE false
                END AS scc_infraction_flag,
                CASE
                    WHEN rslt.cry_day IS NULL OR rslt.cry_day::text = ''::text THEN NULL::date
                    ELSE concat(rslt.test_year, '-', rslt.test_month, '-', rslt.cry_day)::date
                END AS cry_date,
            cry_thr.infraction_window AS cry_infraction_window,
                CASE
                    WHEN rslt.cry_value > cry_thr.upper_limit THEN true
                    ELSE false
                END AS cry_infraction_flag,
                CASE
                    WHEN rslt.ffa_day IS NULL OR rslt.ffa_day::text = ''::text THEN NULL::date
                    ELSE concat(rslt.test_year, '-', rslt.test_month, '-', rslt.ffa_day)::date
                END AS ffa_date,
            ffa_thr.infraction_window AS ffa_infraction_window,
                CASE
                    WHEN rslt.ffa_value > ffa_thr.upper_limit THEN true
                    ELSE false
                END AS ffa_infraction_flag,
                CASE
                    WHEN rslt.ih_day IS NULL OR rslt.ih_day::text = ''::text THEN NULL::date
                    ELSE concat(rslt.test_year, '-', rslt.test_month, '-', rslt.ih_day)::date
                END AS ih_date,
            ih_thr.infraction_window AS ih_infraction_window,
                CASE
                    WHEN rslt.ih_value > ih_thr.upper_limit THEN true
                    ELSE false
                END AS ih_infraction_flag
           FROM mals_app.mal_dairy_farm_test_result rslt
             LEFT JOIN thresholds spc1_thr ON spc1_thr.species_sub_code::text = 'SPC1'::text
             LEFT JOIN thresholds scc_thr ON scc_thr.species_sub_code::text = 'SCC'::text
             LEFT JOIN thresholds cry_thr ON cry_thr.species_sub_code::text = 'CRY'::text
             LEFT JOIN thresholds ffa_thr ON ffa_thr.species_sub_code::text = 'FFA'::text
             LEFT JOIN thresholds ih_thr ON ih_thr.species_sub_code::text = 'IH'::text
        ), result2 AS (
         SELECT result1.test_result_id,
            result1.test_job_id,
            result1.irma_number,
            result1.spc1_date,
            (result1.spc1_date - result1.spc1_infraction_window::interval + '1 day'::interval)::date AS spc1_previous_infraction_first_date,
            result1.spc1_infraction_flag,
            result1.scc_date,
            (result1.scc_date - result1.scc_infraction_window::interval + '1 day'::interval)::date AS scc_previous_infraction_first_date,
            result1.scc_infraction_flag,
            result1.cry_date,
            (result1.cry_date - result1.cry_infraction_window::interval + '1 day'::interval)::date AS cry_previous_infraction_first_date,
            result1.cry_infraction_flag,
            result1.ffa_date,
            (result1.ffa_date - result1.ffa_infraction_window::interval + '1 day'::interval)::date AS ffa_previous_infraction_first_date,
            result1.ffa_infraction_flag,
            result1.ih_date,
            (result1.ih_date - result1.ih_infraction_window::interval + '1 day'::interval)::date AS ih_previous_infraction_first_date,
            result1.ih_infraction_flag
           FROM result1
        ), result3 AS (
         SELECT result2.test_result_id,
            result2.test_job_id,
            result2.irma_number,
            lic.id AS licence_id,
            result2.spc1_date,
            result2.spc1_infraction_flag,
            result2.spc1_previous_infraction_first_date,
            ( SELECT count(*) AS count
                   FROM mals_app.mal_dairy_farm_test_result sub
                  WHERE sub.irma_number::text = result2.irma_number::text AND sub.spc1_infraction_flag = true AND sub.spc1_date >= result2.spc1_previous_infraction_first_date AND sub.spc1_date < result2.spc1_date) AS spc1_previous_infraction_count,
            result2.scc_date,
            result2.scc_infraction_flag,
            result2.scc_previous_infraction_first_date,
            ( SELECT count(*) AS count
                   FROM mals_app.mal_dairy_farm_test_result sub
                  WHERE sub.irma_number::text = result2.irma_number::text AND sub.scc_infraction_flag = true AND sub.scc_date >= result2.scc_previous_infraction_first_date AND sub.scc_date < result2.scc_date) AS scc_previous_infraction_count,
            result2.cry_date,
            result2.cry_infraction_flag,
            result2.cry_previous_infraction_first_date,
            ( SELECT count(*) AS count
                   FROM mals_app.mal_dairy_farm_test_result sub
                  WHERE sub.irma_number::text = result2.irma_number::text AND sub.cry_infraction_flag = true AND sub.cry_date >= result2.cry_previous_infraction_first_date AND sub.cry_date < result2.cry_date) AS cry_previous_infraction_count,
            result2.ffa_date,
            result2.ffa_infraction_flag,
            result2.ffa_previous_infraction_first_date,
            ( SELECT count(*) AS count
                   FROM mals_app.mal_dairy_farm_test_result sub
                  WHERE sub.irma_number::text = result2.irma_number::text AND sub.ffa_infraction_flag = true AND sub.ffa_date >= result2.ffa_previous_infraction_first_date AND sub.ffa_date < result2.ffa_date) AS ffa_previous_infraction_count,
            result2.ih_date,
            result2.ih_infraction_flag,
            result2.ih_previous_infraction_first_date,
            ( SELECT count(*) AS count
                   FROM mals_app.mal_dairy_farm_test_result sub
                  WHERE sub.irma_number::text = result2.irma_number::text AND sub.ih_infraction_flag = true AND sub.ih_date >= result2.ih_previous_infraction_first_date AND sub.ih_date < result2.ih_date) AS ih_previous_infraction_count
           FROM result2
             LEFT JOIN mals_app.mal_licence lic ON result2.irma_number::text = lic.irma_number::text
        ), infractions AS (
         SELECT subq.species_code,
            subq.species_sub_code,
            subq.upper_limit,
            subq.infraction_window,
            subq.previous_infractions_count,
            subq.levy_percentage,
            subq.correspondence_code,
            subq.correspondence_description,
                CASE
                    WHEN subq.previous_infractions_count = max(subq.previous_infractions_count) OVER (PARTITION BY subq.species_sub_code) THEN true
                    ELSE NULL::boolean
                END AS max_previous_infractions_flag
           FROM ( SELECT thr.species_code,
                    thr.species_sub_code,
                    thr.upper_limit,
                    thr.infraction_window,
                    inf.previous_infractions_count,
                    inf.levy_percentage,
                    inf.correspondence_code,
                    inf.correspondence_description
                   FROM mals_app.mal_dairy_farm_test_threshold_lu thr
                     JOIN mals_app.mal_dairy_farm_test_infraction_lu inf ON thr.id = inf.test_threshold_id AND thr.active_flag = true AND inf.active_flag = true) subq
        )
 SELECT result3.test_result_id,
    result3.test_job_id,
    result3.licence_id,
    result3.irma_number,
    result3.spc1_date,
    result3.spc1_infraction_flag,
    result3.spc1_previous_infraction_first_date,
    result3.spc1_previous_infraction_count,
    spc1_inf.levy_percentage AS spc1_levy_percentage,
    spc1_inf.correspondence_code AS spc1_correspondence_code,
    spc1_inf.correspondence_description AS spc1_correspondence_description,
    result3.scc_date,
    result3.scc_infraction_flag,
    result3.scc_previous_infraction_first_date,
    result3.scc_previous_infraction_count,
    scc_inf.levy_percentage AS scc_levy_percentage,
    scc_inf.correspondence_code AS scc_correspondence_code,
    scc_inf.correspondence_description AS scc_correspondence_description,
    result3.cry_date,
    result3.cry_infraction_flag,
    result3.cry_previous_infraction_first_date,
    result3.cry_previous_infraction_count,
    cry_inf.levy_percentage AS cry_levy_percentage,
    cry_inf.correspondence_code AS cry_correspondence_code,
    cry_inf.correspondence_description AS cry_correspondence_description,
    result3.ffa_date,
    result3.ffa_infraction_flag,
    result3.ffa_previous_infraction_first_date,
    result3.ffa_previous_infraction_count,
    ffa_inf.levy_percentage AS ffa_levy_percentage,
    ffa_inf.correspondence_code AS ffa_correspondence_code,
    ffa_inf.correspondence_description AS ffa_correspondence_description,
    result3.ih_date,
    result3.ih_infraction_flag,
    result3.ih_previous_infraction_first_date,
    result3.ih_previous_infraction_count,
    ih_inf.levy_percentage AS ih_levy_percentage,
    ih_inf.correspondence_code AS ih_correspondence_code,
    ih_inf.correspondence_description AS ih_correspondence_description
   FROM result3
     LEFT JOIN infractions spc1_inf ON result3.spc1_infraction_flag = true AND spc1_inf.species_sub_code::text = 'SPC1'::text AND (result3.spc1_previous_infraction_count = spc1_inf.previous_infractions_count OR result3.spc1_previous_infraction_count > spc1_inf.previous_infractions_count AND spc1_inf.max_previous_infractions_flag = true)
     LEFT JOIN infractions scc_inf ON result3.scc_infraction_flag = true AND scc_inf.species_sub_code::text = 'SCC'::text AND (result3.scc_previous_infraction_count = scc_inf.previous_infractions_count OR result3.scc_previous_infraction_count > scc_inf.previous_infractions_count AND scc_inf.max_previous_infractions_flag = true)
     LEFT JOIN infractions cry_inf ON result3.cry_infraction_flag = true AND cry_inf.species_sub_code::text = 'CRY'::text AND (result3.cry_previous_infraction_count = cry_inf.previous_infractions_count OR result3.cry_previous_infraction_count > cry_inf.previous_infractions_count AND cry_inf.max_previous_infractions_flag = true)
     LEFT JOIN infractions ffa_inf ON result3.ffa_infraction_flag = true AND ffa_inf.species_sub_code::text = 'FFA'::text AND (result3.spc1_previous_infraction_count = ffa_inf.previous_infractions_count OR result3.spc1_previous_infraction_count > ffa_inf.previous_infractions_count AND ffa_inf.max_previous_infractions_flag = true)
     LEFT JOIN infractions ih_inf ON result3.ih_infraction_flag = true AND ih_inf.species_sub_code::text = 'IH'::text AND (result3.spc1_previous_infraction_count = ih_inf.previous_infractions_count OR result3.spc1_previous_infraction_count > ih_inf.previous_infractions_count AND ih_inf.max_previous_infractions_flag = true);

-- Permissions

ALTER TABLE mals_app.mal_dairy_farm_test_infraction_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_dairy_farm_test_infraction_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_dairy_farm_test_infraction_vw TO mals_app_role;


-- mals_app.mal_licence_action_required_vw source

CREATE OR REPLACE VIEW mals_app.mal_licence_action_required_vw
AS SELECT lic.id AS licence_id,
    lic.licence_number,
    lic.licence_type_id,
    lictyp.licence_type,
    rgn.region_name,
    licstat.code_name AS licence_status,
    lictyp.legislation AS licence_type_legislation,
    lic.company_name,
    NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text) AS registrant_name,
        CASE
            WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
            ELSE COALESCE(reg.last_name, reg.first_name)
        END AS registrant_last_first,
    btrim(concat(lic.address_line_1, ' ', lic.address_line_2)) AS licence_address,
    lic.city AS licence_city,
    lic.province AS licence_province,
    lic.postal_code AS licence_postal_code,
    lic.primary_phone AS licence_primary_phone,
    lic.secondary_phone AS licence_secondary_phone,
    lic.fax_number AS licence_fax_number,
    reg.email_address
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     LEFT JOIN mals_app.mal_region_lu rgn ON lic.region_id = rgn.id
  WHERE lic.action_required = true;

-- Permissions

ALTER TABLE mals_app.mal_licence_action_required_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_action_required_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_licence_action_required_vw TO mals_app_role;


-- mals_app.mal_licence_species_vw source

CREATE OR REPLACE VIEW mals_app.mal_licence_species_vw
AS WITH inventory_details AS (
         SELECT mal_fur_farm_inventory.licence_id,
            mal_fur_farm_inventory.species_sub_code_id,
            mal_fur_farm_inventory.recorded_date,
            mal_fur_farm_inventory.recorded_value
           FROM mals_app.mal_fur_farm_inventory
        UNION ALL
         SELECT mal_game_farm_inventory.licence_id,
            mal_game_farm_inventory.species_sub_code_id,
            mal_game_farm_inventory.recorded_date,
            mal_game_farm_inventory.recorded_value
           FROM mals_app.mal_game_farm_inventory
        )
 SELECT dtl.licence_id,
    spec.id AS species_code_id,
    spec.code_name AS species_code,
    sum(
        CASE spec_sub.code_name
            WHEN 'FEMALE'::text THEN dtl.recorded_value
            ELSE 0::double precision
        END) AS female_count,
    sum(
        CASE spec_sub.code_name
            WHEN 'MALE'::text THEN dtl.recorded_value
            ELSE 0::double precision
        END) AS male_count,
    sum(
        CASE spec_sub.code_name
            WHEN 'CALVES'::text THEN dtl.recorded_value
            ELSE 0::double precision
        END) AS calves_count,
    sum(
        CASE spec_sub.code_name
            WHEN 'SLAUGHTERED'::text THEN dtl.recorded_value
            ELSE 0::double precision
        END) AS slaughtered_count
   FROM inventory_details dtl
     JOIN mals_app.mal_licence_species_sub_code_lu spec_sub ON dtl.species_sub_code_id = spec_sub.id
     JOIN mals_app.mal_licence_species_code_lu spec ON spec_sub.species_code_id = spec.id
  GROUP BY dtl.licence_id, spec.id, spec.code_name;

-- Permissions

ALTER TABLE mals_app.mal_licence_species_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_species_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_licence_species_vw TO mals_app_role;


-- mals_app.mal_licence_summary_vw source

CREATE OR REPLACE VIEW mals_app.mal_licence_summary_vw
AS SELECT lic.id AS licence_id,
    lic.licence_type_id,
    lic.status_code_id,
    lic.primary_registrant_id,
    lic.region_id,
    lic.regional_district_id,
    lic.plant_code_id,
    lic.species_code_id,
    lic.licence_number,
    lic.irma_number,
    lictyp.licence_type,
    reg.last_name,
    reg.first_name,
    lic.company_name,
    lic.primary_phone,
    lic.secondary_phone,
    lic.fax_number,
    reg.email_address,
    stat.code_description AS licence_status,
    lic.application_date,
    lic.issue_date,
    lic.expiry_date,
    lic.reissue_date,
    lic.fee_collected,
    lic.bond_continuation_expiry_date,
    rgn.region_name,
    dist.district_name,
    lic.address_line_1,
    lic.address_line_2,
    lic.city,
    lic.province,
    lic.postal_code,
    lic.country,
    lic.mail_address_line_1,
    lic.mail_address_line_2,
    lic.mail_city,
    lic.mail_province,
    lic.mail_postal_code,
    lic.mail_country,
        CASE
            WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
            ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
        END AS derived_mailing_address,
        CASE
            WHEN lic.mail_address_line_1 IS NULL THEN lic.city
            ELSE lic.mail_city
        END AS derived_mailing_city,
        CASE
            WHEN lic.mail_address_line_1 IS NULL THEN lic.province
            ELSE lic.mail_province
        END AS derived_mailing_province,
        CASE
            WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
            ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
        END AS derived_mailing_postal_code,
    sp.code_name AS licence_species_code,
    lic.action_required,
    lic.print_certificate,
    lic.print_renewal,
    lic.print_dairy_infraction
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu stat ON lic.status_code_id = stat.id
     LEFT JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     LEFT JOIN mals_app.mal_region_lu rgn ON lic.region_id = rgn.id
     LEFT JOIN mals_app.mal_regional_district_lu dist ON lic.regional_district_id = dist.id
     LEFT JOIN mals_app.mal_licence_species_code_lu sp ON lic.species_code_id = sp.id;

-- Permissions

ALTER TABLE mals_app.mal_licence_summary_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_summary_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_licence_summary_vw TO mals_app_role;


-- mals_app.mal_licence_type_species_vw source

CREATE OR REPLACE VIEW mals_app.mal_licence_type_species_vw
AS WITH inventory_details AS (
         SELECT mal_fur_farm_inventory.licence_id,
            mal_fur_farm_inventory.species_sub_code_id,
            mal_fur_farm_inventory.recorded_date,
            mal_fur_farm_inventory.recorded_value
           FROM mals_app.mal_fur_farm_inventory
        UNION ALL
         SELECT mal_game_farm_inventory.licence_id,
            mal_game_farm_inventory.species_sub_code_id,
            mal_game_farm_inventory.recorded_date,
            mal_game_farm_inventory.recorded_value
           FROM mals_app.mal_game_farm_inventory
        ), inventory_summary AS (
         SELECT dtl.licence_id,
            sum(
                CASE sp_sub.code_name
                    WHEN 'FEMALE'::text THEN dtl.recorded_value
                    ELSE 0::double precision
                END) AS female_count,
            sum(
                CASE sp_sub.code_name
                    WHEN 'MALE'::text THEN dtl.recorded_value
                    ELSE 0::double precision
                END) AS male_count,
            sum(
                CASE sp_sub.code_name
                    WHEN 'CALVES'::text THEN dtl.recorded_value
                    ELSE 0::double precision
                END) AS calves_count,
            sum(
                CASE sp_sub.code_name
                    WHEN 'SLAUGHTERED'::text THEN dtl.recorded_value
                    ELSE 0::double precision
                END) AS slaughtered_count
           FROM inventory_details dtl
             JOIN mals_app.mal_licence_species_sub_code_lu sp_sub ON dtl.species_sub_code_id = sp_sub.id
          GROUP BY dtl.licence_id
        ), licence_details AS (
         SELECT lic.id AS licence_id,
            lic.licence_number,
            typ.id AS licence_type_id,
            typ.licence_type,
            lic.issue_date,
            lic.expiry_date,
            reg.last_name,
            reg.first_name,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_mailing_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_mailing_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_mailing_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_mailing_postal_code,
            reg.primary_phone,
            reg.email_address,
            lic.fee_collected,
            lic.bond_continuation_expiry_date,
            sp.code_name AS licence_species_name
           FROM mals_app.mal_licence lic
             JOIN mals_app.mal_licence_type_lu typ ON lic.licence_type_id = typ.id
             LEFT JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_licence_species_code_lu sp ON lic.species_code_id = sp.id
        )
 SELECT licdtl.licence_id,
    licdtl.licence_number,
    licdtl.licence_type_id,
    licdtl.licence_type,
    licdtl.issue_date,
    licdtl.expiry_date,
    licdtl.last_name,
    licdtl.first_name,
    licdtl.derived_mailing_address,
    licdtl.derived_mailing_city,
    licdtl.derived_mailing_province,
    licdtl.derived_mailing_postal_code,
    licdtl.primary_phone,
    licdtl.email_address,
    licdtl.fee_collected,
    licdtl.bond_continuation_expiry_date,
    licdtl.licence_species_name,
    invsum.female_count,
    invsum.male_count,
    invsum.calves_count,
    invsum.slaughtered_count
   FROM licence_details licdtl
     LEFT JOIN inventory_summary invsum ON licdtl.licence_id = invsum.licence_id;

-- Permissions

ALTER TABLE mals_app.mal_licence_type_species_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_licence_type_species_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_licence_type_species_vw TO mals_app_role;


-- mals_app.mal_print_card_vw source

CREATE OR REPLACE VIEW mals_app.mal_print_card_vw
AS WITH licence_base AS (
         SELECT lictyp.licence_type,
            lic.company_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS derived_company_name,
            NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
            lic.licence_number::character varying AS licence_number,
            lic.issue_date,
            lic.expiry_date,
            to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display
           FROM mals_app.mal_licence lic
             JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
          WHERE lic.print_certificate = true AND licstat.code_name::text = 'ACT'::text
        )
 SELECT licence_base.licence_type,
        CASE licence_base.licence_type
            WHEN 'BULK TANK MILK GRADER'::text THEN json_agg(json_build_object('CardLabel', 'Bulk Tank Milk Grader''s Identification Card', 'LicenceHolderCompany', licence_base.company_name, 'LicenceHolderName', licence_base.registrant_name, 'LicenceNumber', licence_base.licence_number, 'ExpiryDate', licence_base.expiry_date_display) ORDER BY licence_base.company_name, licence_base.licence_number)
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_agg(json_build_object('CardType', 'Livestock Dealer Agent''s Identification Card', 'LicenceHolderName', licence_base.registrant_name, 'LastFirstName', licence_base.registrant_last_first, 'LicenceNumber', licence_base.licence_number, 'StartDate', to_char(GREATEST(licence_base.issue_date::timestamp with time zone, date_trunc('year'::text, licence_base.expiry_date::timestamp with time zone) - '9 mons'::interval), 'FMMonth dd, yyyy'::text), 'ExpiryDate', licence_base.expiry_date_display) ORDER BY licence_base.registrant_name, licence_base.licence_number)
            WHEN 'LIVESTOCK DEALER'::text THEN json_agg(json_build_object('CardType', 'Livestock Dealer''s Identification Card', 'LicenceHolderCompany', licence_base.derived_company_name, 'LicenceNumber', licence_base.licence_number, 'StartDate', to_char(GREATEST(licence_base.issue_date::timestamp with time zone, date_trunc('year'::text, licence_base.expiry_date::timestamp with time zone) - '9 mons'::interval), 'FMMonth dd, yyyy'::text), 'ExpiryDate', licence_base.expiry_date_display) ORDER BY licence_base.derived_company_name, licence_base.licence_number)
            ELSE NULL::json
        END AS card_json
   FROM licence_base
  WHERE licence_base.licence_type::text = ANY (ARRAY['BULK TANK MILK GRADER'::character varying::text, 'LIVESTOCK DEALER AGENT'::character varying::text, 'LIVESTOCK DEALER'::character varying::text])
  GROUP BY licence_base.licence_type;

-- Permissions

ALTER TABLE mals_app.mal_print_card_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_card_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_card_vw TO mals_app_role;


-- mals_app.mal_print_certificate_vw source

CREATE OR REPLACE VIEW mals_app.mal_print_certificate_vw
AS WITH licence_base AS (
         SELECT lic.id AS licence_id,
            lic.licence_number,
            prnt_lic.licence_number AS parent_licence_number,
            lictyp.licence_type,
            spec.code_name AS species_description,
            lictyp.legislation AS licence_type_legislation,
            licstat.code_name AS licence_status,
            reg.first_name AS registrant_first_name,
            reg.last_name AS registrant_last_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS company_name,
            NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
            reg.official_title,
                CASE
                    WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name::text
                    ELSE NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)
                END AS derived_licence_holder_name,
                CASE
                    WHEN prnt_lic.company_name_override AND prnt_lic.company_name IS NOT NULL THEN prnt_lic.company_name::text
                    ELSE NULLIF(btrim(concat(prnt_reg.first_name, ' ', prnt_reg.last_name)), ''::text)
                END AS derived_parent_licence_holder_name,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_mailing_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_mailing_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_mailing_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_mailing_postal_code,
            lic.issue_date,
            to_char(lic.issue_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS issue_date_display,
            lic.reissue_date,
            to_char(lic.reissue_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS reissue_date_display,
            lic.expiry_date,
            to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display,
            lic.bond_number,
            lic.bond_value,
            lic.bond_carrier_name,
            lic.irma_number,
            lic.total_hives,
            reg.primary_phone,
                CASE
                    WHEN reg.primary_phone IS NULL THEN NULL::text
                    ELSE concat('(', substr(reg.primary_phone::text, 1, 3), ') ', substr(reg.primary_phone::text, 4, 3), '-', substr(reg.primary_phone::text, 7, 4))
                END AS registrant_primary_phone_display,
            reg.email_address,
            lic.print_certificate
           FROM mals_app.mal_licence lic
             JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
             LEFT JOIN mals_app.mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
             LEFT JOIN mals_app.mal_registrant prnt_reg ON prnt_lic.primary_registrant_id = prnt_reg.id
             LEFT JOIN mals_app.mal_licence_species_code_lu spec ON lic.species_code_id = spec.id
             LEFT JOIN mals_app.mal_licence_type_lu sp_lt ON spec.licence_type_id = sp_lt.id
          WHERE lic.print_certificate = true
        ), active_site AS (
         SELECT s.id AS site_id,
            l.id AS licence_id,
            l_t.licence_type,
            s.apiary_site_id,
            concat(l.licence_number, '-', s.apiary_site_id) AS registration_number,
            btrim(concat(s.address_line_1, ' ', s.address_line_2)) AS address_1_2,
            btrim(concat(s.address_line_1, ' ', s.address_line_2, ' ', s.city, ' ', s.province, ' ', s.postal_code)) AS full_address,
            s.city,
            to_char(s.registration_date, 'yyyy/mm/dd'::text) AS registration_date,
            s.legal_description,
            s.site_details,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mals_app.mal_licence l
             JOIN mals_app.mal_site s ON l.id = s.licence_id
             JOIN mals_app.mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mals_app.mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE stat.code_name::text = 'ACT'::text AND l.print_certificate = true
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address_1_2, 'City', active_site.city, 'RegDate', active_site.registration_date) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dairy_tank AS (
         SELECT ast.licence_id,
            json_agg(json_build_object('DairyTankCompany', t.company_name, 'DairyTankModel', t.model_number, 'DairyTankSN', t.serial_number, 'DairyTankCapacity', t.tank_capacity, 'DairyTankCalibrationDate', to_char(t.calibration_date, 'yyyy/mm/dd'::text)) ORDER BY t.serial_number, t.calibration_date) AS tank_json
           FROM active_site ast
             JOIN mals_app.mal_dairy_farm_tank t ON ast.site_id = t.site_id
          GROUP BY ast.licence_id
        )
 SELECT base.licence_type,
    base.licence_number,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'TotalColonies', base.total_hives, 'ApiarySites', apiary.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'DAIRY FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ReIssueDate', base.reissue_date_display, 'SiteDetails', site.full_address, 'SiteInformation', tank.tank_json, 'IRMA_Num', base.irma_number)
            WHEN 'FUR FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'Species', base.species_description, 'SiteDetails', site.site_details)
            WHEN 'GAME FARM'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'Species', base.species_description, 'LegalDescription', site.legal_description)
            WHEN 'HIDE DEALER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'LIMITED MEDICATED FEED'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'SiteDetails', site.site_details)
            WHEN 'LIVESTOCK DEALER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'Nominee', base.registrant_name)
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'AgentFor', base.derived_parent_licence_holder_name)
            WHEN 'MEDICATED FEED'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'LicenceHolderName', base.registrant_name, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'PUBLIC SALE YARD OPERATOR'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'LivestockDealerLicence', base.parent_licence_number, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'SaleYard', base.derived_parent_licence_holder_name)
            WHEN 'PURCHASE LIVE POULTRY'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'SiteDetails', site.site_details, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name, 'BusinessAddressLocation',
            CASE
                WHEN base.derived_mailing_address = site.address_1_2 THEN NULL::text
                ELSE site.address_1_2
            END)
            WHEN 'SLAUGHTERHOUSE'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value, 'BondCarrier', base.bond_carrier_name)
            WHEN 'VETERINARY DRUG'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderCompany', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            WHEN 'DISPENSER'::text THEN json_build_object('ActsAndRegs', base.licence_type_legislation, 'LicenceHolderName', base.derived_licence_holder_name, 'LicenceHolderTitle', base.official_title, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'IssueDate', base.issue_date_display, 'ExpiryDate', base.expiry_date_display)
            ELSE NULL::json
        END AS certificate_json,
    json_build_object('RegistrantLastFirst', base.registrant_last_first, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code) AS envelope_json
   FROM licence_base base
     LEFT JOIN apiary_site apiary ON base.licence_id = apiary.licence_id
     LEFT JOIN active_site site ON base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dairy_tank tank ON base.licence_id = tank.licence_id
  WHERE 1 = 1 AND base.licence_status::text = 'ACT'::text;

-- Permissions

ALTER TABLE mals_app.mal_print_certificate_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_certificate_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_certificate_vw TO mals_app_role;


-- mals_app.mal_print_dairy_farm_infraction_vw source

CREATE OR REPLACE VIEW mals_app.mal_print_dairy_farm_infraction_vw
AS WITH base AS (
         SELECT rslt.id AS dairy_farm_test_result_id,
            rslt.licence_id,
            lic.licence_number,
            lictyp.licence_type,
            to_char(CURRENT_DATE::timestamp with time zone, 'fmMonth dd, yyyy'::text) AS currentdate,
            rslt.irma_number,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS licence_holder_company,
            lic.print_dairy_infraction,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_mailing_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_mailing_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_mailing_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_mailing_postal_code,
            to_char(rslt.create_timestamp, 'fmMonth dd, yyyy'::text) AS test_result_create_date,
            to_char((((rslt.test_year::character varying::text || to_char(rslt.test_month, 'fm09'::text)) || '01'::text)::date)::timestamp with time zone, 'fmMonth, yyyy'::text) AS levy_month_year,
            site.site_details,
            to_char(lic.issue_date::timestamp with time zone, 'fmMonth dd, yyyy'::text) AS issue_date,
            rslt.spc1_date,
            to_char(rslt.spc1_value, 'fm999999990'::text) AS spc1_value,
            rslt.spc1_infraction_flag,
                CASE
                    WHEN rslt.spc1_levy_percentage IS NOT NULL THEN concat(rslt.spc1_levy_percentage, '%')
                    ELSE NULL::text
                END AS spc1_levy_percentage,
            rslt.spc1_correspondence_code,
            rslt.spc1_correspondence_description,
            rslt.scc_date,
            to_char(rslt.scc_value, 'fm999999990'::text) AS scc_value,
            rslt.scc_infraction_flag,
                CASE
                    WHEN rslt.scc_levy_percentage IS NOT NULL THEN concat(rslt.scc_levy_percentage, '%')
                    ELSE NULL::text
                END AS scc_levy_percentage,
            rslt.scc_correspondence_code,
            rslt.scc_correspondence_description,
            rslt.cry_date,
            to_char(rslt.cry_value, 'fm990.0'::text) AS cry_value,
            rslt.cry_infraction_flag,
                CASE
                    WHEN rslt.cry_levy_percentage IS NOT NULL THEN concat(rslt.cry_levy_percentage, '%')
                    ELSE NULL::text
                END AS cry_levy_percentage,
            rslt.cry_correspondence_code,
            rslt.cry_correspondence_description,
            rslt.ffa_date,
            to_char(rslt.ffa_value, 'fm990.0'::text) AS ffa_value,
            rslt.ffa_infraction_flag,
                CASE
                    WHEN rslt.ffa_levy_percentage IS NOT NULL THEN concat(rslt.ffa_levy_percentage, '%')
                    ELSE NULL::text
                END AS ffa_levy_percentage,
            rslt.ffa_correspondence_code,
            rslt.ffa_correspondence_description,
            rslt.ih_date,
            to_char(rslt.ih_value, 'fm990.00'::text) AS ih_value,
            rslt.ih_infraction_flag,
                CASE
                    WHEN rslt.ih_levy_percentage IS NOT NULL THEN concat(rslt.ih_levy_percentage, '%')
                    ELSE NULL::text
                END AS ih_levy_percentage,
            rslt.ih_correspondence_code,
            rslt.ih_correspondence_description
           FROM mals_app.mal_dairy_farm_test_result rslt
             LEFT JOIN mals_app.mal_licence lic ON rslt.licence_id = lic.id
             LEFT JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             LEFT JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_site site ON lic.id = site.licence_id
        )
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'SPC1'::text AS species_sub_code,
    base.spc1_date AS recorded_date,
    base.spc1_correspondence_code AS correspondence_code,
    base.spc1_correspondence_description AS correspondence_description,
        CASE base.spc1_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SPC1', 'DairyTestIBC', base.spc1_value, 'CorrespondenceCode', base.spc1_correspondence_code, 'LevyPercent', base.spc1_levy_percentage, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.spc1_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'SCC'::text AS species_sub_code,
    base.scc_date AS recorded_date,
    base.scc_correspondence_code AS correspondence_code,
    base.scc_correspondence_description AS correspondence_description,
        CASE base.scc_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'SCC', 'DairyTestSCC', base.scc_value, 'CorrespondenceCode', base.scc_correspondence_code, 'LevyPercent', base.scc_levy_percentage, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.scc_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'CRY'::text AS species_sub_code,
    base.cry_date AS recorded_date,
    base.cry_correspondence_code AS correspondence_code,
    base.cry_correspondence_description AS correspondence_description,
        CASE base.cry_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'CRY', 'DairyTestCryoPercent', base.cry_value, 'CorrespondenceCode', base.cry_correspondence_code, 'LevyPercent', base.cry_levy_percentage, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.cry_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'FFA'::text AS species_sub_code,
    base.ffa_date AS recorded_date,
    base.ffa_correspondence_code AS correspondence_code,
    base.ffa_correspondence_description AS correspondence_description,
        CASE base.ffa_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'FFA', 'DairyTestFFA', base.ffa_value, 'CorrespondenceCode', base.ffa_correspondence_code, 'LevyPercent', base.ffa_levy_percentage, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.ffa_infraction_flag = true
UNION ALL
 SELECT base.dairy_farm_test_result_id,
    base.licence_id,
    base.licence_number,
    base.licence_type,
    base.print_dairy_infraction,
    'IH'::text AS species_sub_code,
    base.ih_date AS recorded_date,
    base.ih_correspondence_code AS correspondence_code,
    base.ih_correspondence_description AS correspondence_description,
        CASE base.ih_infraction_flag
            WHEN true THEN json_build_object('CurrentDate', base.currentdate, 'IRMA_Num', base.irma_number, 'LicenceHolderCompany', base.licence_holder_company, 'MailingAddress', base.derived_mailing_address, 'MailingCity', base.derived_mailing_city, 'MailingProv', base.derived_mailing_province, 'PostCode', base.derived_mailing_postal_code, 'DairyTestDataLoadDate', base.test_result_create_date, 'LevyMonthYear', base.levy_month_year, 'SpeciesSubCode', 'IH', 'DairyTestIH', base.ih_value, 'CorrespondenceCode', base.ih_correspondence_code, 'LevyPercent', base.ih_levy_percentage, 'SiteDetails', base.site_details, 'IssueDate', base.issue_date)
            ELSE NULL::json
        END AS infraction_json
   FROM base
  WHERE base.ih_infraction_flag = true;

-- Permissions

ALTER TABLE mals_app.mal_print_dairy_farm_infraction_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_dairy_farm_infraction_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_dairy_farm_infraction_vw TO mals_app_role;


-- mals_app.mal_print_dairy_farm_tank_recheck_vw source

CREATE OR REPLACE VIEW mals_app.mal_print_dairy_farm_tank_recheck_vw
AS WITH licence AS (
         SELECT lictyp.licence_type,
            lic.id AS licence_id,
            lic.licence_number,
            lic.irma_number,
            reg.last_name,
            rgn.region_name,
            dist.district_name,
            tank.id AS tank_id,
            tank.issue_date,
            tank.recheck_year,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS company_name,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_mailing_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_mailing_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_mailing_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_mailing_postal_code,
            tank.print_recheck_notice
           FROM mals_app.mal_dairy_farm_tank tank
             JOIN mals_app.mal_site site ON tank.site_id = site.id
             JOIN mals_app.mal_licence lic ON site.licence_id = lic.id
             JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             LEFT JOIN mals_app.mal_region_lu rgn ON site.region_id = rgn.id
             LEFT JOIN mals_app.mal_regional_district_lu dist ON site.regional_district_id = dist.id
        )
 SELECT licence.licence_type,
    licence.licence_id,
    licence.licence_number,
    licence.irma_number,
    licence.last_name,
    licence.region_name,
    licence.district_name,
    licence.tank_id,
    licence.issue_date,
    licence.recheck_year,
    licence.print_recheck_notice,
    json_build_object('CurrentDate', to_char(CURRENT_DATE::timestamp with time zone, 'fmMonth dd, yyyy'::text), 'CurrentYear', to_char(CURRENT_DATE::timestamp with time zone, 'yyyy'::text), 'IRMA_Num', licence.irma_number, 'LicenceHolderCompany', licence.company_name, 'MailingAddress', licence.derived_mailing_address, 'MailingCity', licence.derived_mailing_city, 'MailingProv', licence.derived_mailing_province, 'PostCode', licence.derived_mailing_postal_code) AS recheck_notice_json
   FROM licence;

-- Permissions

ALTER TABLE mals_app.mal_print_dairy_farm_tank_recheck_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_dairy_farm_tank_recheck_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_dairy_farm_tank_recheck_vw TO mals_app_role;


-- mals_app.mal_print_renewal_vw source

CREATE OR REPLACE VIEW mals_app.mal_print_renewal_vw
AS WITH licence_base AS (
         SELECT lic.id AS licence_id,
            lic.licence_number::character varying AS licence_number,
            lictyp.id AS licence_type_id,
            lictyp.licence_type,
            spec.code_name AS species_code,
            licstat.code_name AS licence_status,
            reg.first_name AS registrant_first_name,
            reg.last_name AS registrant_last_name,
            COALESCE(lic.company_name, NULLIF(concat(reg.first_name, ' ', reg.last_name), ' '::text)::character varying) AS company_name,
            NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text) AS registrant_name,
                CASE
                    WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
                    ELSE COALESCE(reg.last_name, reg.first_name)
                END AS registrant_last_first,
                CASE
                    WHEN lic.company_name_override AND lic.company_name IS NOT NULL THEN lic.company_name::text
                    ELSE NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)
                END AS derived_licence_holder_name,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN btrim(concat(lic.address_line_1, ' ', lic.address_line_2))
                    ELSE btrim(concat(lic.mail_address_line_1, ' ', lic.mail_address_line_2))
                END AS derived_address,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.city
                    ELSE lic.mail_city
                END AS derived_city,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN lic.province
                    ELSE lic.mail_province
                END AS derived_province,
                CASE
                    WHEN lic.mail_address_line_1 IS NULL THEN concat(substr(lic.postal_code::text, 1, 3), ' ', substr(lic.postal_code::text, 4, 3))
                    ELSE concat(substr(lic.mail_postal_code::text, 1, 3), ' ', substr(lic.mail_postal_code::text, 4, 3))
                END AS derived_postal_code,
            lic.expiry_date,
            to_char(lic.expiry_date::timestamp with time zone, 'FMMonth dd, yyyy'::text) AS expiry_date_display,
            lictyp.standard_issue_date,
            to_char(lictyp.standard_issue_date, 'FMMonth dd, yyyy'::text) AS standard_issue_date_display,
            lictyp.standard_expiry_date,
            to_char(lictyp.standard_expiry_date, 'FMMonth dd, yyyy'::text) AS standard_expiry_date_display,
            to_char(lictyp.standard_expiry_date, 'FMyyyy'::text) AS standard_expiry_year_display,
            to_char(lictyp.standard_fee, 'FM990.00'::text) AS licence_fee_display,
            lic.bond_carrier_name,
            lic.bond_number,
            to_char(lic.bond_value, 'FM999,990.00'::text) AS bond_value_display,
                CASE
                    WHEN reg.primary_phone IS NULL THEN NULL::text
                    ELSE concat('(', substr(reg.primary_phone::text, 1, 3), ') ', substr(reg.primary_phone::text, 4, 3), '-', substr(reg.primary_phone::text, 7, 4))
                END AS registrant_primary_phone_display,
            reg.email_address,
            lic.total_hives
           FROM mals_app.mal_licence lic
             JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
             JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
             JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
             LEFT JOIN mals_app.mal_licence_parent_child_xref xref ON lic.id = xref.child_licence_id
             LEFT JOIN mals_app.mal_licence prnt_lic ON xref.parent_licence_id = prnt_lic.id
             LEFT JOIN mals_app.mal_licence_species_code_lu spec ON lic.species_code_id = spec.id
             LEFT JOIN mals_app.mal_licence_type_lu sp_lt ON spec.licence_type_id = sp_lt.id
          WHERE lic.print_renewal = true
        ), active_site AS (
         SELECT s.id AS site_id,
            l.id AS licence_id,
            l_t.licence_type,
            s.apiary_site_id,
            concat(l.licence_number, '-', s.apiary_site_id) AS registration_number,
            btrim(concat(s.address_line_1, ' ', s.address_line_2)) AS address,
            s.city,
            to_char(s.registration_date, 'yyyy/mm/dd'::text) AS registration_date,
            s.legal_description,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::character varying
                    ELSE s.address_line_1
                END AS derived_site_mailing_address,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::character varying
                    ELSE s.city
                END AS derived_site_mailing_city,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::character varying
                    ELSE s.province
                END AS derived_site_mailing_province,
                CASE
                    WHEN l.address_line_1::text = s.address_line_1::text THEN NULL::text
                    ELSE concat(substr(s.postal_code::text, 1, 3), ' ', substr(s.postal_code::text, 4, 3))
                END AS derived_site_postal_code,
            row_number() OVER (PARTITION BY s.licence_id ORDER BY s.create_timestamp) AS row_seq
           FROM mals_app.mal_licence l
             JOIN mals_app.mal_site s ON l.id = s.licence_id
             JOIN mals_app.mal_licence_type_lu l_t ON l.licence_type_id = l_t.id
             LEFT JOIN mals_app.mal_status_code_lu stat ON s.status_code_id = stat.id
          WHERE l.print_renewal = true AND stat.code_name::text = 'ACT'::text AND (l_t.licence_type::text = ANY (ARRAY['APIARY'::character varying::text, 'FUR FARM'::character varying::text, 'GAME FARM'::character varying::text]))
        ), apiary_site AS (
         SELECT active_site.licence_id,
            json_agg(json_build_object('RegistrationNum', active_site.registration_number, 'Address', active_site.address, 'City', active_site.city, 'RegDate', active_site.registration_date) ORDER BY active_site.apiary_site_id) AS apiary_site_json
           FROM active_site
          WHERE active_site.licence_type::text = 'APIARY'::text
          GROUP BY active_site.licence_id
        ), dispenser AS (
         SELECT prnt_lic.id AS parent_licence_id,
            json_agg(json_build_object('DispLicenceHolderName', NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text)) ORDER BY (NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text))) AS dispenser_json
           FROM mals_app.mal_licence prnt_lic
             JOIN mals_app.mal_licence_parent_child_xref xref ON xref.parent_licence_id = prnt_lic.id
             JOIN mals_app.mal_licence disp_1 ON xref.child_licence_id = disp_1.id
             JOIN mals_app.mal_registrant reg ON disp_1.primary_registrant_id = reg.id
             JOIN mals_app.mal_licence_type_lu prnt_ltyp ON prnt_lic.licence_type_id = prnt_ltyp.id
             JOIN mals_app.mal_licence_type_lu disp_ltyp ON disp_1.licence_type_id = disp_ltyp.id
          WHERE disp_ltyp.licence_type::text = 'DISPENSER'::text
          GROUP BY prnt_lic.id
        ), licence_species AS (
         SELECT ltyp.id AS licence_type_id,
            json_agg(json_build_object('Species', spec.code_name) ORDER BY spec.code_name) AS species_json
           FROM mals_app.mal_licence_type_lu ltyp
             JOIN mals_app.mal_licence_species_code_lu spec ON ltyp.id = spec.licence_type_id
          WHERE spec.active_flag = true
          GROUP BY ltyp.id
        )
 SELECT base.licence_id,
    base.licence_number,
    base.licence_type,
    base.licence_status,
        CASE base.licence_type
            WHEN 'APIARY'::text THEN json_build_object('LastFirstName', base.registrant_last_first, 'LicenceHolderCompany', base.company_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'BeeKeeperID', base.licence_number, 'Phone', base.registrant_primary_phone_display, 'Email', base.email_address, 'ExpiryDate', base.expiry_date_display, 'TotalColonies', base.total_hives, 'ApiarySites', apiary_site.apiary_site_json)
            WHEN 'BULK TANK MILK GRADER'::text THEN json_build_object('LicenceYear', base.standard_expiry_year_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'FUR FARM'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'SiteMailingAddress', site.derived_site_mailing_address, 'SiteMailingCity', site.derived_site_mailing_city, 'SiteMailingProv', site.derived_site_mailing_province, 'SitePostCode', site.derived_site_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'SpeciesInventory', species.species_json)
            WHEN 'GAME FARM'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'ClientPhoneNumber', base.registrant_primary_phone_display, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'SiteMailingAddress', site.derived_site_mailing_address, 'SiteMailingCity', site.derived_site_mailing_city, 'SiteMailingProv', site.derived_site_mailing_province, 'SitePostCode', site.derived_site_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'SiteLegalDescription', site.legal_description, 'SpeciesInventory', base.species_code)
            WHEN 'HIDE DEALER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIMITED MEDICATED FEED'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER AGENT'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            WHEN 'LIVESTOCK DEALER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.company_name, 'LicenceHolderName', base.registrant_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondCarrier', base.bond_carrier_name, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'MEDICATED FEED'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'Dispensers', disp.dispenser_json)
            WHEN 'PUBLIC SALE YARD OPERATOR'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.company_name, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'PURCHASE LIVE POULTRY'::text THEN json_build_object('LicenceHolderName', base.registrant_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'BondCarrier', base.bond_carrier_name, 'BondNumber', base.bond_number, 'BondValue', base.bond_value_display)
            WHEN 'SLAUGHTERHOUSE'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderName', base.registrant_name, 'LicenceHolderPhone', base.registrant_primary_phone_display, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number)
            WHEN 'VETERINARY DRUG'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LicenceHolderCompany', base.derived_licence_holder_name, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display, 'Dispensers', disp.dispenser_json)
            WHEN 'DISPENSER'::text THEN json_build_object('LicenceStart', base.standard_issue_date_display, 'LicenceExpiry', base.standard_expiry_date_display, 'LastFirstName', base.registrant_last_first, 'MailingAddress', base.derived_address, 'MailingCity', base.derived_city, 'MailingProv', base.derived_province, 'PostCode', base.derived_postal_code, 'PhoneNumber', base.registrant_primary_phone_display, 'LicenceName', base.licence_type, 'LicenceNumber', base.licence_number, 'LicenceFee', base.licence_fee_display)
            ELSE NULL::json
        END AS renewal_json
   FROM licence_base base
     LEFT JOIN apiary_site ON base.licence_type::text = 'APIARY'::text AND base.licence_id = apiary_site.licence_id
     LEFT JOIN active_site site ON (base.licence_type::text = ANY (ARRAY['FUR FARM'::character varying::text, 'GAME FARM'::character varying::text])) AND base.licence_id = site.licence_id AND site.row_seq = 1
     LEFT JOIN dispenser disp ON (base.licence_type::text = ANY (ARRAY['MEDICATED FEED'::character varying::text, 'VETERINARY DRUG'::character varying::text])) AND base.licence_id = disp.parent_licence_id
     LEFT JOIN licence_species species ON base.licence_type_id = species.licence_type_id;

-- Permissions

ALTER TABLE mals_app.mal_print_renewal_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_print_renewal_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_print_renewal_vw TO mals_app_role;


-- mals_app.mal_site_detail_vw source

CREATE OR REPLACE VIEW mals_app.mal_site_detail_vw
AS SELECT site.id AS site_id_pk,
    lic.id AS licence_id,
    site.status_code_id AS site_status_id,
    sitestat.code_name AS site_status,
    lic.status_code_id AS licence_status_id,
    licstat.code_name AS licence_status,
    lic.licence_type_id,
    lictyp.licence_type,
    lic.licence_number,
    lic.irma_number AS licence_irma_number,
    site.apiary_site_id,
        CASE lictyp.licence_type
            WHEN 'APIARY'::text THEN concat(lic.licence_number, '-', site.apiary_site_id)
            ELSE NULL::text
        END AS apiary_site_id_display,
    site.contact_name AS site_contact_name,
    site.address_line_1 AS site_address_line_1,
    reg.first_name AS registrant_first_name,
    reg.last_name AS registrant_last_name,
    NULLIF(btrim(concat(reg.first_name, ' ', reg.last_name)), ''::text) AS registrant_first_last,
        CASE
            WHEN reg.first_name IS NOT NULL AND reg.last_name IS NOT NULL THEN concat(reg.last_name, ', ', reg.first_name)::character varying
            ELSE COALESCE(reg.last_name, reg.first_name)
        END AS registrant_last_first,
    lic.company_name,
    reg.primary_phone AS registrant_primary_phone,
    reg.email_address AS registrant_email_address,
    lic.city AS licence_city,
    r.region_number AS licence_region_number,
    r.region_name AS licence_region_name,
    rd.district_number AS licence_regional_district_number,
    rd.district_name AS licence_regional_district_name
   FROM mals_app.mal_licence lic
     JOIN mals_app.mal_site site ON lic.id = site.licence_id
     JOIN mals_app.mal_status_code_lu sitestat ON site.status_code_id = sitestat.id
     JOIN mals_app.mal_licence_type_lu lictyp ON lic.licence_type_id = lictyp.id
     JOIN mals_app.mal_status_code_lu licstat ON lic.status_code_id = licstat.id
     JOIN mals_app.mal_registrant reg ON lic.primary_registrant_id = reg.id
     LEFT JOIN mals_app.mal_region_lu r ON site.region_id = r.id
     LEFT JOIN mals_app.mal_regional_district_lu rd ON site.regional_district_id = rd.id;

-- Permissions

ALTER TABLE mals_app.mal_site_detail_vw OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_site_detail_vw TO mals;
GRANT SELECT ON TABLE mals_app.mal_site_detail_vw TO mals_app_role;



CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json(ip_print_category character varying, ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_certificate_json_count       integer default 0;
	l_envelope_json_count          integer default 0;
	l_card_json_count              integer default 0;
	l_renewal_json_count           integer default 0;  
	l_dairy_infraction_json_count  integer default 0; 
	l_recheck_notice_json_count    integer default 0;  
  begin
	  --
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => ip_print_category, 
			iop_print_job_id    => iop_print_job_id
			);
	--
	-- Populate the CERTIFICATE, ENVELOPE and CARD JSONs.
	if ip_print_category = 'CERTIFICATE' then
		 --
		 --  Generate the CERTIFICATE JSONs
		 --
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'CERTIFICATE',
			certificate_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_certificate_vw;
		GET DIAGNOSTICS l_certificate_json_count = ROW_COUNT;
		 --
		 --  Generate the ENVELOPE JSONs
		 --
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'ENVELOPE',
			envelope_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_certificate_vw;
		GET DIAGNOSTICS l_envelope_json_count = ROW_COUNT;
		 --
		 --  Generate the CARD JSONs, one row per licence type.
		 --
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			null,
			'CARD',
			card_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_card_vw;
		GET DIAGNOSTICS l_card_json_count = ROW_COUNT;
	end if;
	--
	-- Populate the RENEWAL JSONs.
	if ip_print_category = 'RENEWAL' then
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'RENEWAL',
			renewal_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_renewal_vw;
		GET DIAGNOSTICS l_renewal_json_count = ROW_COUNT;
	end if;
	--
	-- Populate the DAIRY_INFRACTION JSONs.
	if ip_print_category = 'DAIRY_INFRACTION' then
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'DAIRY_INFRACTION',
			infraction_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_dairy_farm_infraction_vw
		where print_dairy_infraction = true
	and recorded_date between ip_start_date and ip_end_date;
		GET DIAGNOSTICS l_dairy_infraction_json_count = ROW_COUNT;
	end if;
	--
	-- Populate the RECHECK_NOTICE JSONs.
	if ip_print_category = 'RECHECK_NOTICE' then
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select 
			iop_print_job_id,
			licence_type,
			licence_number,
			'RECHECK_NOTICE',
			recheck_notice_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from mal_print_dairy_farm_tank_recheck_vw
		where print_recheck_notice = true;
		GET DIAGNOSTICS l_recheck_notice_json_count = ROW_COUNT;
	end if;
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		certificate_json_count        = l_certificate_json_count,
		envelope_json_count           = l_envelope_json_count,
		card_json_count               = l_card_json_count,
		renewal_json_count            = l_renewal_json_count,
		dairy_infraction_json_count   = l_dairy_infraction_json_count,
		recheck_notice_json_count     = l_recheck_notice_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json(in varchar, in date, in date, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json(in varchar, in date, in date, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json(in varchar, in date, in date, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json(in varchar, in date, in date, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_action_required(ip_licence_type_id integer, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_type_summary as (
		select 
			licence_type,
			json_agg(json_build_object('LicenceNumber',         licence_number,
									   'LastFirstName',         registrant_last_first,
									   'MailingAddress',        licence_address,
									   'MailingCity',           licence_city,
									   'MailingProv',           licence_province,
									   'PostCode',              licence_postal_code,
									   'Phone',                 licence_primary_phone,
									   'Email',                 email_address,
									   'LicenceHolderCompany',  company_name)
		                                order by licence_number) licence_json,
		    count(*) num_rows
		from mal_licence_action_required_vw
		where licence_type_id = ip_licence_type_id
		group by licence_type)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		licence_type,
		null,
		'ACTION_REQUIRED',
		json_build_object('DateTime',       to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Type',   licence_type,
						  'Licence',        licence_json,
						  'RowCount',       num_rows) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_type_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_action_required(in int4, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_action_required(in int4, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_action_required(in int4, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_action_required(in int4, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_inspection(ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with details as (   
		select 			
			licence_id,
			licence_number,
			apiary_site_id,
			region_name,
			last_name,
			first_name,
			inspection_date,
			colonies_tested,
			brood_tested,
			american_foulbrood_result,
			european_foulbrood_result,
			nosema_result,
			chalkbrood_result,
			sacbrood_result,
			varroa_tested,
			varroa_mite_result,
			varroa_mite_result_percent,
			small_hive_beetle_tested,
			small_hive_beetle_result,
			supers_inspected,
			supers_destroyed,
			hives_per_apiary,
			hive_count
		from mal_apiary_inspection_vw
		where inspection_date between ip_start_date and ip_end_date
		),
	licence_summary as (
		select 
			json_agg(json_build_object('LicenceNumber',          licence_number,
									   'SiteID',                 apiary_site_id,
									   'LastName',               last_name,
									   'FirstName',              first_name,
									   'ColoniesInspected',      colonies_tested,
									   'BroodsInspected',        brood_tested,
									   'AFB',                    american_foulbrood_result,
									   'EFB',                    european_foulbrood_result,
									   'Nosema',                 nosema_result,
									   'Chalkbrood',             chalkbrood_result,
									   'Sacbrood',               sacbrood_result,
									   'VarroaColoniesTested',   varroa_tested,
									   'VarroaMites',            varroa_mite_result,
									   'VarroaMitesPercent',     varroa_mite_result_percent,
									   'SHBColoniesTested',      small_hive_beetle_tested,
									   'SHB',                    small_hive_beetle_result,
									   'SupersInspected',        supers_inspected,
									   'SupersDestroyed',        supers_destroyed,
									   'HivesInApiary',          hives_per_apiary,
									   'TotalNumHives',          hive_count)
									   order by licence_number) licence_json
		from details),
	region_summary as (
		select 
			json_agg(json_build_object('RegionName',             region_name,
							           'ColoniesInspected',      region_colonies_tested,
									   'BroodsInspected',        region_brood_tested,
							           'AFB',                    region_american_foulbrood_result,
							           'EFB',                    region_european_foulbrood_result,
							           'Nosema',                 region_nosema_result,
							           'Chalkbrood',             region_chalkbrood_result,
							           'Sacbrood',               region_sacbrood_result,
							           'VarroaColoniesTested',   region_varroa_tested,
							           'VarroaMites',            region_varroa_mite_result,
							           'SHBColoniesTested',      region_small_hive_beetle_tested,
							           'SHB',                    region_small_hive_beetle_result,
							           'SupersInspected',        region_supers_inspected,
							           'SupersDestroyed',        region_supers_destroyed)
									   order by region_name) region_json
		from (
				select 
					region_name,
					coalesce(sum(colonies_tested), 0) region_colonies_tested,
					coalesce(sum(brood_tested), 0) region_brood_tested,
					coalesce(sum(american_foulbrood_result), 0) region_american_foulbrood_result,
					coalesce(sum(european_foulbrood_result), 0) region_european_foulbrood_result,
					coalesce(sum(nosema_result), 0) region_nosema_result,
					coalesce(sum(chalkbrood_result), 0) region_chalkbrood_result,
					coalesce(sum(sacbrood_result), 0) region_sacbrood_result,
					coalesce(sum(varroa_tested), 0) region_varroa_tested,
					coalesce(sum(varroa_mite_result), 0) region_varroa_mite_result,
					coalesce(sum(small_hive_beetle_tested), 0) region_small_hive_beetle_tested,
					coalesce(sum(small_hive_beetle_result), 0) region_small_hive_beetle_result,
					coalesce(sum(supers_inspected), 0) region_supers_inspected,
					coalesce(sum(supers_destroyed), 0) region_supers_destroyed
				from details
				group by region_name) region_totals),
	report_summary as ( 
		select 
			coalesce(sum(colonies_tested), 0) tot_colonies_tested,
			coalesce(sum(brood_tested), 0) tot_brood_tested,
			coalesce(sum(american_foulbrood_result), 0) tot_american_foulbrood_result,
			coalesce(sum(european_foulbrood_result), 0) tot_european_foulbrood_result,
			coalesce(sum(nosema_result), 0) tot_nosema_result,
			coalesce(sum(chalkbrood_result), 0) tot_chalkbrood_result,
			coalesce(sum(sacbrood_result), 0) tot_sacbrood_result,
			coalesce(sum(varroa_tested), 0) tot_varroa_tested,
			coalesce(sum(varroa_mite_result), 0) tot_varroa_mite_result,
			coalesce(sum(small_hive_beetle_tested), 0) tot_small_hive_beetle_tested,
			coalesce(sum(small_hive_beetle_result), 0) tot_small_hive_beetle_result,
			coalesce(sum(supers_inspected), 0) tot_supers_inspected,
			coalesce(sum(supers_destroyed), 0) tot_supers_destroyed
		from details)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'APIARY',
		null,
		'APIARY_INSPECTION',
		   json_build_object('DateTime',                     to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
							 'DateRangeStart',               to_char(ip_start_date, 'fmyyyy-mm-dd hh24mi'),
							 'DateRangeEnd',                 to_char(ip_end_date, 'fmyyyy-mm-dd hh24mi'),
							 'Licence',                      lic_sum.licence_json,		
							 'Region',                       rgn_sum.region_json,
							 'Tot_Colonies_Inspected',       rpt_sum.tot_colonies_tested,
							 'Tot_Broods_Inspected',         rpt_sum.tot_brood_tested,
							 'Tot_AFB',                      rpt_sum.tot_american_foulbrood_result,
							 'Tot_EFB',                      rpt_sum.tot_european_foulbrood_result,
							 'Tot_Nosema',                   rpt_sum.tot_nosema_result,
							 'Tot_Chalkbrood',               rpt_sum.tot_chalkbrood_result,
							 'Tot_Sacbrood',                 rpt_sum.tot_sacbrood_result,
							 'Tot_Colonies_Tested_Varroa',   rpt_sum.tot_varroa_tested,
							 'Tot_Varroa_Mites',             rpt_sum.tot_varroa_mite_result,
							 'Tot_Colonies_Tested_SHB',      rpt_sum.tot_small_hive_beetle_tested,
							 'Tot_SHB',                      rpt_sum.tot_small_hive_beetle_result,
							 'Tot_SupersInspected',          rpt_sum.tot_supers_inspected,
						     'Tot_SupersDestroyed',          rpt_sum.tot_supers_destroyed) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_summary lic_sum
	cross join region_summary rgn_sum
	cross join report_summary rpt_sum;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_apiary_inspection(in date, in date, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_inspection(in date, in date, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_inspection(in date, in date, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_inspection(in date, in date, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_producer_city(ip_city character varying, ip_min_hives integer, ip_max_hives integer, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with site_summary as (
			select 
				json_agg(json_build_object('LicenceNumber',         licence_number,
										   'LastName',              registrant_last_name,
										   'FirstName',             registrant_first_name,
										   'PrimaryPhone',          site_primary_phone,
										   'Email',                 registrant_email_address,
										   'Address',               site_address,
										   'City',                  site_city,
										   'Registration_Date',     registration_date,										   
										   'Num_Hives',             site_hive_count)
			                                order by licence_number) licence_json,
				count(licence_number) num_producers,
				sum(site_hive_count) num_hives
			from mal_apiary_producer_vw
			where site_city = ip_city
			and site_hive_count between ip_min_hives and ip_max_hives)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'APIARY',
		null,
		'APIARY_PRODUCER_CITY',
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'NumColoniesBegin',   ip_min_hives,
						  'NumColoniesEnd',     ip_max_hives,
						  'Reg',                licence_json,
						  'Tot_Producers',      num_producers,
						  'Tot_Hives',          num_hives) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from site_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_apiary_producer_city(in varchar, in int4, in int4, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_city(in varchar, in int4, in int4, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_city(in varchar, in int4, in int4, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_city(in varchar, in int4, in int4, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_producer_district(INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
			select licence_id,
				site_regional_district_id,
				count(*) num_sites,
				sum(site_hive_count) num_hives,
				count(case when site_hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			group by licence_id,
				site_regional_district_id),
		district_summary as (
			select coalesce(dist.district_name, 'No Region Specified') district_name,
				count(case when num_sites between 1 and  9 then 1 else null end) num_sites_1to9,
				count(case when num_sites >= 10            then 1 else null end) num_sites_10plus,
				count(case when num_sites between 1 and 24 then 1 else null end) num_sites_1to24,
				count(case when num_sites >= 25            then 1 else null end) num_sites_25plus,
				count(*) num_sites,
				sum(case when num_sites between 1 and  9 then num_hives else 0 end) num_hives_1to9,
				sum(case when num_sites >= 10            then num_hives else 0 end) num_hives_10plus,
				sum(case when num_sites between 1 and 24 then num_hives else 0 end) num_hives_1to24,
				sum(case when num_sites >= 25            then num_hives else 0 end) num_hives_25plus,
				sum(num_hives) num_hives,
				sum(num_producers_hives_0) num_producers_hives_0
			from licence_summary ls
			left join mal_regional_district_lu dist
			on ls.site_regional_district_id = dist.id
			group by dist.district_name),
		report_summary as (
			select 
				json_agg(json_build_object('DistrictName',       district_name,
										   'Producers1To9',      num_sites_1to9,
										   'Producers10Plus',    num_sites_10plus,
										   'Producers1To24',     num_sites_1to24,
										   'Producers25Plus',    num_sites_25plus,
										   'ProducersTotal',     num_sites,
										   'Colonies1To9',       num_hives_1to9,
										   'Colonies10Plus',     num_hives_10plus,	
										   'Colonies1To24',      num_hives_1to24,
										   'Colonies25Plus',     num_hives_25plus,										   
										   'ColoniesTotal',      num_hives)
			                                order by district_name) district_json,
				sum(num_sites_1to9) total_sites_1To9,
				sum(num_sites_10plus) total_sites_10Plus,
				sum(num_sites_1to24) total_sites_1To24,
				sum(num_sites_25plus) total_sites_25Plus,
				sum(num_sites) total_sites,
				sum(num_hives_1to9) total_hives_1To9,
				sum(num_hives_10plus) total_hives_10Plus,
				sum(num_hives_1to24) total_hives_1To24,
				sum(num_hives_25plus) total_hives_25Plus,
				sum(num_hives) total_hives,
				sum(num_producers_hives_0) total_producers_hives_0
			from district_summary)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'APIARY',
		null,
		'APIARY_PRODUCER_DISTRICT',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'District',                  district_json,
						  'TotalProducers1To9',        total_sites_1To9,
						  'TotalProducers10Plus',      total_sites_10Plus,
						  'TotalProducers1To24',       total_sites_1To24,
						  'TotalProducers25Plus',      total_sites_25Plus,
						  'TotalNumProducers',         total_sites,
						  'TotalColonies1To9',         total_hives_1To9,
						  'TotalColonies10Plus',       total_hives_10Plus,
						  'TotalColonies1To24',        total_hives_1To24,
						  'TotalColonies25Plus',       total_hives_25Plus,
						  'TotalNumColonies',          total_hives,
						  'ProducersWithNoColonies',   total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from report_summary;  
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_apiary_producer_district(inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_district(inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_district(inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_district(inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_producer_region(INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
			select licence_id,
				site_region_id,
				count(*) num_sites,
				sum(site_hive_count) num_hives,
				count(case when site_hive_count = 0 then 1 else null end) num_producers_hives_0
			from mals_app.mal_apiary_producer_vw 
			group by licence_id,
				site_region_id),
		region_summary as (
			select coalesce(rgn.region_name, 'No Region Specified') region_name,
				count(case when num_sites between 1 and  9 then 1 else null end) num_sites_1to9,
				count(case when num_sites >= 10            then 1 else null end) num_sites_10plus,
				count(case when num_sites between 1 and 24 then 1 else null end) num_sites_1to24,
				count(case when num_sites >= 25            then 1 else null end) num_sites_25plus,
				count(*) num_sites,
				sum(case when num_sites between 1 and  9 then num_hives else 0 end) num_hives_1to9,
				sum(case when num_sites >= 10            then num_hives else 0 end) num_hives_10plus,
				sum(case when num_sites between 1 and 24 then num_hives else 0 end) num_hives_1to24,
				sum(case when num_sites >= 25            then num_hives else 0 end) num_hives_25plus,
				sum(num_hives) num_hives,
				sum(num_producers_hives_0) num_producers_hives_0
			from licence_summary ls
			left join mal_region_lu rgn
			on ls.site_region_id = rgn.id
			group by rgn.region_name),
		report_summary as (
			select 
				json_agg(json_build_object('RegionName',       region_name,
										   'Producers1To9',      num_sites_1to9,
										   'Producers10Plus',    num_sites_10plus,
										   'Producers1To24',     num_sites_1to24,
										   'Producers25Plus',    num_sites_25plus,
										   'ProducersTotal',     num_sites,
										   'Colonies1To9',       num_hives_1to9,
										   'Colonies10Plus',     num_hives_10plus,	
										   'Colonies1To24',      num_hives_1to24,
										   'Colonies25Plus',     num_hives_25plus,										   
										   'ColoniesTotal',      num_hives)
			                                order by region_name) region_json,
				sum(num_sites_1to9) total_sites_1To9,
				sum(num_sites_10plus) total_sites_10Plus,
				sum(num_sites_1to24) total_sites_1To24,
				sum(num_sites_25plus) total_sites_25Plus,
				sum(num_sites) total_sites,
				sum(num_hives_1to9) total_hives_1To9,
				sum(num_hives_10plus) total_hives_10Plus,
				sum(num_hives_1to24) total_hives_1To24,
				sum(num_hives_25plus) total_hives_25Plus,
				sum(num_hives) total_hives,
				sum(num_producers_hives_0) total_producers_hives_0
			from region_summary)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'APIARY',
		null,
		'APIARY_PRODUCER_REGION',
		json_build_object('DateTime',                  to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Region',                    region_json,
						  'TotalProducers1To9',        total_sites_1To9,
						  'TotalProducers10Plus',      total_sites_10Plus,
						  'TotalProducers1To24',       total_sites_1To24,
						  'TotalProducers25Plus',      total_sites_25Plus,
						  'TotalNumProducers',         total_sites,
						  'TotalColonies1To9',         total_hives_1To9,
						  'TotalColonies10Plus',       total_hives_10Plus,
						  'TotalColonies1To24',        total_hives_1To24,
						  'TotalColonies25Plus',       total_hives_25Plus,
						  'TotalNumColonies',          total_hives,
						  'ProducersWithNoColonies',   total_producers_hives_0) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from report_summary;  
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_apiary_producer_region(inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_region(inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_region(inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_producer_region(inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_apiary_site(ip_region_name character varying, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with site_summary as (
			select 
				json_agg(json_build_object('RegionName',          site_region_name,
										   'DistrictName',        site_district_name,
										   'LicenceNumber',       licence_number,
										   'LastName',            registrant_last_name,
										   'FirstName',           registrant_first_name,
										   'PrimaryPhone',        registrant_primary_phone,
										   'Email',               registrant_email_address,
										   'Num_Colonies',        site_hive_count,
										   'Address',             site_address,
										   'City',                site_city,
										   'Registration_Date',   registration_date,										   
										   'Num_Hives',           licence_hive_count)
			                                order by licence_number) licence_json,
				count(licence_number) total_producers,
				sum(licence_hive_count) total_hives
			from mal_apiary_producer_vw
			where site_region_name = ip_region_name)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'APIARY',
		null,
		'APIARY_SITE', 
		json_build_object('DateTime',           to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Reg',                licence_json,
						  'Tot_Producers',      total_producers,
						  'Tot_Hives',          total_hives) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from site_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_apiary_site(in varchar, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_site(in varchar, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_site(in varchar, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_apiary_site(in varchar, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(ip_irma_number character varying, ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with tank_details as (
		select licence_id,
			json_agg(json_build_object('Date',  to_char(greatest(spc1_date,scc_date,cry_date,ffa_date,ih_date), 'fmyyyy-mm-dd'),
									   'IBC',   spc1_value,
									   'SCC',   scc_value,
									   'CRY',   cry_value,
									   'FFA',   ffa_value,
									   'IH',    ih_value)
		                                order by greatest(spc1_date,scc_date,cry_date,ffa_date,ih_date)) test_json,
		    avg(spc1_value) average_spc1,
		    avg(scc_value) average_scc,
		    avg(cry_value) average_cry,
		    avg(ffa_value) average_ffa,
		    avg(ih_value) average_ih
		from mal_dairy_farm_test_result
		where irma_number = ip_irma_number
		and greatest(spc1_date,scc_date,cry_date,ffa_date,ih_date) 
			between ip_start_date and ip_end_date  
		group by licence_id
		),
	licence_details as (
		select 
			json_agg(json_build_object('IRMA_NUM',               tank.irma_number,
										'Status',                tank.licence_status,
										'LicenceHolderCompany',  tank.company_name,
										'LastnameFirstName',     tank.registrant_last_first,
										'Address',               tank.address,
										'City',                  tank.city,
										'Province',              tank.province,
										'Postcode',              tank.postal_code,
										'Phone',                 tank.registrant_primary_phone,
										'Fax',                   tank.registrant_fax_number,
										'Cell',                  tank.registrant_secondary_phone,
										'Email',                 tank.registrant_email_address,
										'IssueDate',             tank.issue_date_display,
										'SiteAddress',           tank.site_address,
										'SiteCity',              tank.site_city,
										'SiteProvince',          tank.site_province,
										'TankCompany',           tank.tank_company_name,
										'TankModel',             tank.tank_model_number,
										'TankSerial',            tank.tank_serial_number,
										'TankCapacity',          tank.tank_capacity,
										'LastInspectionDate',    to_char(tank.inspection_date, 'fmyyyy-mm-dd hh24mi'),
										'LastInspector',         tank.inspector_name,
										'Insp',                  dtl.test_json,
										'Avg_IBC',               to_char(dtl.average_spc1,'fm9999990.0'),
										'Avg_SCC',               to_char(dtl.average_scc,'fm9999990.0'),
										'Avg_CRY',               to_char(dtl.average_cry,'fm9999990.0'),
										'Avg_FFA',               to_char(dtl.average_ffa,'fm9999990.0'),
										'Avg_IH',                to_char(dtl.average_ih,'fm9999990.0'))
		                                order by licence_number) licence_json
		from mal_dairy_farm_tank_vw tank
		left join tank_details dtl
		on tank.licence_id = dtl.licence_id
		where tank.irma_number = ip_irma_number
		)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'DAIRY FARM',
		null,
		'DAIRY_FARM_DETAIL',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'DateRangeStart',      to_char(ip_start_date, 'fmyyyy-mm-dd'),
						  'DateRangeEnd',        to_char(ip_end_date, 'fmyyyy-mm-dd'),
						  'Client',              licence_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_details;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(in varchar, in date, in date, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(in varchar, in date, in date, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(in varchar, in date, in date, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_details(in varchar, in date, in date, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_quality(ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
		select lic.id licence_id,
			lic.irma_number,	
		    -- Consider the Company Name Override flag to determine the Licence Holder name.
		    case 
			  when lic.company_name_override and lic.company_name is not null 
			  then lic.company_name
			  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
			end derived_licence_holder_name,
			reg.last_name registrant_last_name,
			sum(rslt.scc_value) sum_scc_value,
			count(rslt.scc_value) num_scc_results,
			case when coalesce(count(rslt.scc_value), 0) >0 
				 then sum(rslt.scc_value)/count(rslt.scc_value)
				 else null
			end scc_average,
			sum(rslt.spc1_value) sum_spc1_value,
			count(rslt.spc1_value) num_spc1_results,
			case when coalesce(count(rslt.spc1_value), 0) >0 
				 then sum(rslt.spc1_value)/count(rslt.spc1_value)
				 else null
			end spc1_average
		from mal_licence lic
		inner join mal_registrant reg
		on lic.primary_registrant_id = reg.id
		inner join mal_dairy_farm_test_result rslt
		on lic.id = rslt.licence_id
		where rslt.spc1_date between ip_start_date and ip_end_date
		or    rslt.scc_date  between ip_start_date and ip_end_date
		group by lic.id,
			lic.irma_number,		    
		    case 
			  when lic.company_name_override and lic.company_name is not null 
			  then lic.company_name
			  else nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')
			end,
			reg.last_name),
		json_summary as (
			select 
				json_agg(json_build_object('IRMA_Num',              irma_number,
										   'LicenceHolderCompany',  derived_licence_holder_name,
										   'Lastname',              registrant_last_name,
										   'SCC_Average',           scc_average,
										   'IBC_Average',           spc1_average)
										   order by irma_number) licence_json,
				--  SCC
				sum(sum_scc_value) tot_scc_value,
				sum(num_scc_results) num_scc_results,
				case when coalesce(sum(num_scc_results), 0) >0 
					 then sum(sum_scc_value)/sum(num_scc_results)
					 else null
				end report_scc_average,
				--  SPC1
				sum(sum_spc1_value) tot_spc1_value,
				sum(num_spc1_results) num_spc1_results,
				case when coalesce(sum(num_spc1_results), 0) >0 
					 then sum(sum_spc1_value)/sum(num_spc1_results)
					 else null
				end report_spc1_average
			from licence_summary)
		--
		--  MAIN QUERY
		-- 
		insert into mal_print_job_output(
			print_job_id,
			licence_type,
			licence_number,
			document_type,
			document_json,
			document_binary,
			create_userid,
			create_timestamp,
			update_userid,
			update_timestamp)
		select
			iop_print_job_id,
			'DAIRY FARM',
			null,
			'DAIRY_FARM_QUALITY',
			json_build_object('DateTime',         to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
							  'DateRangeStart',   to_char(ip_start_date, 'fmyyyy-mm-dd'),
							  'DateRangeEnd',     to_char(ip_end_date, 'fmyyyy-mm-dd'),
							  'Reg',              json_summary.licence_json,		
							  'SCC_Report_Avg',   report_scc_average,
							  'IBC_Report_Avg',   report_spc1_average) report_json,
			null,
			current_user,
			current_timestamp,
			current_user,
			current_timestamp
		from json_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_dairy_farm_quality(in date, in date, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_quality(in date, in date, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_quality(in date, in date, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_quality(in date, in date, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_tank_recheck(ip_recheck_year character varying, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with tank_details as (
		select 
			json_agg(json_build_object('IRMA_Num',                irma_number,
									   'LicenceHolderCompany',    derived_licence_holder_name,
									   'YearToCheck',             recheck_year,
									   'TankCalibrationDate',     calibration_date_display,
									   'TankCompany',             tank_company_name,
									   'TankModel',               tank_model_number,
									   'TankSerialNo',            tank_serial_number,
									   'TankCapacity',            tank_capacity)) tank_json,
			count(*) num_tanks
		from mal_dairy_farm_tank_vw
		where recheck_year = ip_recheck_year)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'DAIRY FARM',
		null,
		'DAIRY_FARM_TANK',
		json_build_object('DateTime',            to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'RecheckYear',         ip_recheck_year,
						  'Reg',                 tank_json,
						  'Total_Num_Tanks',   num_tanks) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from tank_details;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_dairy_farm_tank_recheck(in varchar, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_tank_recheck(in varchar, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_tank_recheck(in varchar, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_tank_recheck(in varchar, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_dairy_farm_test_threshold(ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with result_base as (
		select lic.id licence_id,
			rslt.irma_number,			
		    coalesce(lic.company_name, nullif(trim(concat(reg.first_name, ' ', reg.last_name)),'')) derived_licence_holder_name,
		    coalesce(spc1_date, scc_date, cry_date, ffa_date, ih_date) derived_test_date,
		    rslt.spc1_infraction_flag,
		    case when rslt.spc1_infraction_flag then rslt.spc1_value else null end spc1_value,
		    rslt.scc_infraction_flag,
		    case when rslt.scc_infraction_flag then rslt.scc_value else null end scc_value,
		    rslt.cry_infraction_flag,
		    case when rslt.cry_infraction_flag then rslt.cry_value else null end cry_value,
		    rslt.ffa_infraction_flag,
		    case when rslt.ffa_infraction_flag then rslt.ffa_value else null end ffa_value,
		    rslt.ih_infraction_flag,
		    case when rslt.ih_infraction_flag then rslt.ih_value else null end ih_value
		from mal_licence lic
		inner join mal_registrant reg
		on lic.primary_registrant_id = reg.id
		inner join mal_dairy_farm_test_result rslt
		on lic.id = rslt.licence_id
		where greatest(spc1_date, scc_date, cry_date, ffa_date, ih_date) 
				 between ip_start_date and ip_end_date
		and greatest(spc1_infraction_flag, scc_infraction_flag, cry_infraction_flag, ffa_infraction_flag, ih_infraction_flag) = true
		),
	licence_list as (
		select json_agg(json_build_object('IRMA_Num',               irma_number,
										  'LicenceHolderCompany',   derived_licence_holder_name,
										  'TestDate',               derived_test_date,
										  'IBC_Result',             spc1_value,
										  'SCC_Result',             scc_value,
										  'CRY_Result',             cry_value,
										  'FFA_Result',             ffa_value,
										  'IH_Result',              ih_value)
						order by irma_number) licence_json
		from result_base),
	result_summary as (
		select 
			count(spc1_value) spc1_count,
			count(scc_value) scc_count,
			count(cry_value) cry_count,
			count(ffa_value) ffa_count,
			count(ih_value) ih_count
		from result_base)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'DAIRY FARM',
		null,
		'DAIRY_TEST_THRESHOLD',
		json_build_object('DateTime',          to_char(current_timestamp, 'fmyyyy-mm-dd hh24:mi'),
						  'DateRangeStart',    to_char(ip_start_date, 'fmMonth dd, yyyy'),
						  'DateRangeEnd',      to_char(ip_end_date, 'fmMonth dd, yyyy'),
						  'Reg',               list.licence_json,
						  'Tot_IBC_Count',     smry.spc1_count,
						  'Tot_SCC_Count',     smry.scc_count,
						  'Tot_CRY_Count',     smry.cry_count,
						  'Tot_FFA_Count',     smry.ffa_count,
						  'Tot_IH_Count',      smry.ih_count) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_list list
	cross join result_summary smry;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_dairy_farm_test_threshold(in date, in date, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_test_threshold(in date, in date, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_test_threshold(in date, in date, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_dairy_farm_test_threshold(in date, in date, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_licence_expiry(ip_start_date date, ip_end_date date, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_details as (
		select 
			json_agg(json_build_object('LicenceNumber',          licence_number,
										'Lastname',              last_name,
										'FirstName',             first_name,
										'LicenceHolderCompany',  company_name,
										'PrimaryPhone',          primary_phone,
										'Email',                 email_address,
										'LicenceType',           licence_type,
										'IssueDate',             to_char(issue_date, 'fmyyyy-mm-dd'),
										'ExpiryDate',            to_char(expiry_date, 'fmyyyy-mm-dd'))
		                                order by licence_number) licence_json
		from mals_app.mal_licence_summary_vw	
		where licence_type != 'APIARY'
		and expiry_date between ip_start_date and ip_end_date
		)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		null,
		null,
		'LICENCE_EXPIRY',
		json_build_object('DateTime',        to_char(current_timestamp, 'fmyyyy-mm-dd hh12mi'),
						  'DateRangeStart',  to_char(ip_start_date, 'fmyyyy-mm-dd'),
						  'DateRangeEnd',    to_char(ip_end_date, 'fmyyyy-mm-dd'),
						  'Reg',             licence_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_details;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_licence_expiry(in date, in date, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_expiry(in date, in date, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_expiry(in date, in date, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_expiry(in date, in date, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_licence_location(ip_licence_type_id integer, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with licence_summary as (
		select 
			lic.licence_type,
			json_agg(json_build_object('LicenceNumber',               lic.licence_number,
				                       'IssueDate',                   issue_date,     
				                       'ExpiryDate',                  lic.expiry_date,      
				                       'Lastname',                    lic.last_name,
				                       'Firstname',                   lic.first_name,
				                       'MailingAddress',              lic.derived_mailing_address,
				                       'MailingCity',                 lic.derived_mailing_city,
				                       'MailingProv',                 lic.derived_mailing_province,
				                       'PostCode',                    lic.derived_mailing_postal_code,
				                       'Phone',                       lic.primary_phone,
				                       'Email',                       lic.email_address,	
				                       'FeeCollected',                lic.fee_collected,
				                       'BondContinuationExpiryDate',  lic.bond_continuation_expiry_date,                     
				                       'SpeciesType',                 spec.species_code,
				                       'SpeciesMale',                 spec.male_count,
				                       'SpeciesFemale',               spec.female_count)
				                       order by lic.licence_number, spec.species_code) licence_json,
			count(*) num_rows
		from mal_licence_summary_vw lic
		--  MALE and FEMALE accounts are relevant for FUR FARM and GAME FARM
		left join mal_licence_species_vw spec
		on lic.licence_id = spec.licence_id
		where lic.licence_type_id = ip_licence_type_id
		group by lic.licence_type)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		licence_type,
		null,
		'LICENCE_LOCATION',
		json_build_object('DateTime',       to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Type',   licence_type,
						  'Licence',        licence_json,
						  'RowCount',       num_rows) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_licence_location(in int4, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_location(in int4, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_location(in int4, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_licence_location(in int4, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_generate_print_json_veterinary_drug_details(INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_report_json_count       integer default 0;  
  begin	  	  
	--
	-- Start a row in the mal_print_job table
	call pr_start_print_job(
			ip_print_category   => 'REPORT', 
			iop_print_job_id    => iop_print_job_id
			);
	--
	--  Insert the JSON into the output table
	with prnt_lic as (
	    select 
		    lic.licence_id,
		    cast(lic.licence_number as varchar) licence_number,
		    lic.licence_type_id,
		    lic.licence_type,
		    lic.licence_status,
		    lic.company_name,
		    trim(concat(lic.mail_address_line_1 , ' ', lic.mail_address_line_2)) address,
		    lic.city,
		    lic.province,
		    lic.postal_code,
		    case when lic.primary_phone is null 
		    	then null
			    else concat('(', substr(lic.primary_phone, 1, 3),
							') ', substr(lic.primary_phone, 4, 3),
							'-', substr(lic.primary_phone, 7, 4)) 
			end primary_phone_display,
		    case when lic.secondary_phone is null 
		    	then null
			    else concat('(', substr(lic.secondary_phone, 1, 3),
							') ', substr(lic.secondary_phone, 4, 3),
							'-', substr(lic.secondary_phone, 7, 4)) 
			end secondary_phone_display,
		    case when lic.fax_number is null 
		    	then null
			    else concat('(', substr(lic.fax_number, 1, 3),
							') ', substr(lic.fax_number, 4, 3),
							'-', substr(lic.fax_number, 7, 4)) 
			end fax_number_display,
			lic.email_address,
		    lic.issue_date,
		    to_char(lic.issue_date, 'FMMonth dd, yyyy') issue_date_display,
		    lic.expiry_date,
		    to_char(lic.expiry_date, 'FMMonth dd, yyyy') expiry_date_display,
		    lic.fee_collected,
		    to_char(lic.fee_collected,'FM990.00') fee_collected_display
		from mal_licence_summary_vw lic
		where lic.licence_type in ('VETERINARY DRUG')
		and lic.licence_status = 'Active'),
	chld_lic as (
		select prnt_lic.licence_id parent_licence_id,
		    disp_lic.id child_licence_id,
		    disp_lic.licence_number,
		    disp_lictyp.id licence_type_id,
		    disp_lictyp.licence_type,
		    disp_licstat.code_name licence_status,
			trim(concat(disp_lic.mail_address_line_1 , ' ', disp_lic.mail_address_line_2)) address,
		    disp_lic.city,
		    disp_lic.province,
		    disp_lic.postal_code,
		    disp_lic.expiry_date,
		    reg.last_name,
		    reg.first_name,
		    to_char(disp_lic.expiry_date, 'FMyyyy') expiry_date_display,
			-- All Dispenser addresses should be the exact same. Choose one randomly.
		    row_number() over (partition by prnt_lic.licence_id order by null) row_seq,
			count(*) over (partition by prnt_lic.licence_id) num_disp
		from prnt_lic
		left join mal_licence_parent_child_xref xref
		on prnt_lic.licence_id = xref.parent_licence_id			
		left join mal_licence disp_lic
		on xref.child_licence_id = disp_lic.id
		inner join mal_licence_type_lu disp_lictyp
		on disp_lic.licence_type_id = disp_lictyp.id	
	    inner join mal_status_code_lu disp_licstat
	    on disp_lic.status_code_id = disp_licstat.id
	    inner join mal_registrant reg
	    on disp_lic.primary_registrant_id = reg.id
		and disp_lictyp.licence_type in ('DISPENSER')
		and disp_licstat.code_name = 'ACT'),
	chld_smry as (
		select parent_licence_id,
			json_agg(json_build_object('DispLicense',      licence_number,
									   'DispSurname',      last_name,
									   'DispGivenName',    first_name,
									   'DispExpiryDate',   expiry_date_display)
									   order by licence_number)  licence_json
		from chld_lic
		group by parent_licence_id),
	vet_drug_site as (
		select s.id site_id,
		    l.id licence_id,  
		    s.inspector_name,
		    s.inspection_date,
		    -- There should exist only 1 site per Veterinary Drug licence
		    row_number() over (partition by s.licence_id order by s.create_timestamp) row_seq
		from mal_licence l
		inner join mal_site s
		on l.id=s.licence_id
		inner join mal_licence_type_lu l_t
		on l.licence_type_id = l_t.id 
		left join mal_status_code_lu stat
		on s.status_code_id = stat.id
		-- Print flag included to improve performance.
		where stat.code_name='ACT'
		and l_t.licence_type = 'VETERINARY DRUG'
		),
	licence_summary as (
		select 
			prnt_lic.licence_type,
			json_agg(json_build_object('LicenceNumber',             prnt_lic.licence_number,
									   'Status',                    prnt_lic.licence_status,
									   'LicenceHolderCompany',      prnt_lic.company_name,
									   'Address',                   prnt_lic.address,
									   'City',                      prnt_lic.city,
									   'Province',                  prnt_lic.province,
									   'PostCode',                  prnt_lic.postal_code,
									   'Phone',                     prnt_lic.primary_phone_display,
									   'Fax',                       prnt_lic.secondary_phone_display,
									   'Call',                      prnt_lic.fax_number_display,	                      
									   'Email',                     prnt_lic.email_address,
									   'IssueDate',                 prnt_lic.issue_date_display,
									   'ExpiryDate',                prnt_lic.expiry_date_display,
									   'Fee',                       prnt_lic.fee_collected_display,
									   'SiteInspectionDate',        site.inspection_date,
									   'SiteInspector',             site.inspector_name,
									   'DispenserAddress',          chld_lic.address,
									   'DispenserCity',             chld_lic.city,
									   'DispenserProvince',         chld_lic.province,
									   'DispenserPostcode',         chld_lic.postal_code,
									   'Disp',                      chld_smry.licence_json)
									   order by prnt_lic.licence_number) licence_json
	from prnt_lic 
	left join chld_lic
	on prnt_lic.licence_id = chld_lic.parent_licence_id
	and row_seq = 1
	left join chld_smry
	on prnt_lic.licence_id = chld_smry.parent_licence_id
	left join vet_drug_site site
	on prnt_lic.licence_id = site.licence_id
	group by prnt_lic.licence_type)
	--
	--  MAIN QUERY
	--
	insert into mal_print_job_output(
		print_job_id,
		licence_type,
		licence_number,
		document_type,
		document_json,
		document_binary,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	select 
		iop_print_job_id,
		'VETERINARY DRUG',
		null,
		'VETERINARY_DRUG_DETAILS',	
		json_build_object('DateTime',       to_char(current_timestamp, 'fmyyyy-mm-dd hh24mi'),
						  'Licence_Type',   licence_type,
						  'Client',         licence_json) report_json,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp
	from licence_summary;
	--
	GET DIAGNOSTICS l_report_json_count = ROW_COUNT;	
	--
	-- Update the Print Job table.	 
	update mal_print_job set
		job_status                    = 'COMPLETE',
		json_end_time                 = current_timestamp,
		report_json_count             = l_report_json_count,
		update_userid                 = current_user,
		update_timestamp              = current_timestamp
	where id = iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_generate_print_json_veterinary_drug_details(inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_veterinary_drug_details(inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_veterinary_drug_details(inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_generate_print_json_veterinary_drug_details(inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_process_premises_import(ip_job_id integer, INOUT iop_job_status character varying, INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_apiary_type_id          integer;
	l_active_status_id        integer;
	l_file_rec                record;
	l_num_file_rows           integer := 0;
	l_num_file_inserts        integer := 0;
	l_num_file_updates        integer := 0;
	l_num_file_do_not_imports integer := 0;
	l_num_db_inserts          integer := 0;
	l_num_db_updates          integer := 0;
	-- 
	l_licence_id              integer;
	l_licence_number          integer;
	l_site_id                 integer;
	l_apiary_site_id          integer;
	l_registrant_id           integer;
	l_process_comments        varchar(2000);
	l_error_sqlstate          text;
	l_error_message           text;
	l_error_context           text;
  --
  begin
	--
	select 
		count(*) as num_file_rows,
		count(case when import_action in ('NEW_LICENCE', 'NEW_SITE') then 1 else null end) num_file_inserts,
		count(case when import_action = 'UPDATE' then 1 else null end) num_file_updates,
		count(case when import_action = 'DO_NOT_IMPORT' then 1 else null end) num_do_not_imports
	into l_num_file_rows, l_num_file_inserts, l_num_file_updates, l_num_file_do_not_imports
	from mal_premises_detail
	where premises_job_id = ip_job_id;
raise notice 'num_file_rows (%)', l_num_file_rows;
	update mal_premises_job
		set source_row_count = l_num_file_rows,
			source_insert_count = l_num_file_inserts,
			source_update_count = l_num_file_updates,
			source_do_not_import_count = l_num_file_do_not_imports
	where id = ip_job_id;
	--
	select id
	into l_apiary_type_id
	from mal_licence_type_lu
	where licence_type = 'APIARY';
	select id
	into l_active_status_id
	from mal_status_code_lu
	where code_name = 'ACT';
	--
	for l_file_rec in 
		select 
			p.id,
			p.apiary_site_id,
			p.import_action, 
			p.licence_number,
			p.licence_company_name,
			p.licence_mail_address_line_1,
			p.licence_mail_address_line_2,
			p.licence_mail_city,
			p.licence_mail_province,
			p.licence_mail_postal_code,
			p.licence_total_hives,
			p.source_premises_id,
			p.site_address_line_1,
			r.id as region_id,
			p.site_region_name,
			d.id as regional_district_id,
			p.site_regional_district_name,
			p.registrant_first_name,
			p.registrant_last_name,
			p.registrant_primary_phone,
			p.registrant_secondary_phone,
			p.registrant_fax_number,
			p.registrant_email_address,
			p.process_comments
		from mal_premises_detail p
		left join mal_region_lu r
		on p.site_region_name = r.region_name
		left join mal_regional_district_lu d
		on p.site_regional_district_name = d.district_name	
		where p.premises_job_id = ip_job_id 
		and p.import_status = 'PENDING' loop
			l_licence_id            := null;
			l_licence_number        := null;
			l_site_id               := null;
			l_apiary_site_id        := null;
			l_registrant_id         := null;
			l_process_comments      := null;
			l_error_message         := null;
			begin
	--  DO_NOT_IMPORT
				--
				if l_file_rec.import_action in ('DO_NOT_IMPORT') then
				-- Mark the Do Not Import rows.
					update mal_premises_detail
						set import_status    = 'NO_ACTION',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  'This row was marked as DO_NOT_IMPORT and was therefore not processed.')
						where id = l_file_rec.id;
	--  NEW_LICENCE (and Site, and Registrant)
				-- Process new licences and sites
				elsif l_file_rec.import_action in ('NEW_LICENCE' ) then
					-- Create a new Licence.
					insert into mal_licence(
						licence_type_id,
						status_code_id,
						region_id,
						regional_district_id,
						company_name,
						mail_address_line_1,
						mail_address_line_2,
						mail_city,
						mail_province,
						mail_postal_code,
						application_date,
						issue_date,
						expiry_date,
						total_hives
						)
						values(
							l_apiary_type_id,
							l_active_status_id,
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_file_rec.licence_company_name,
							l_file_rec.licence_mail_address_line_1,
							l_file_rec.licence_mail_address_line_2,
							l_file_rec.licence_mail_city,
							l_file_rec.licence_mail_province,
							l_file_rec.licence_mail_postal_code,
							current_date,  -- application_date,
							current_date,  -- issue_date,
							current_date + interval '2 years',  -- expiry_date,
							l_file_rec.licence_total_hives
							)
							returning id, licence_number into l_licence_id, l_licence_number;
					-- First apiary site ID for new licence.
					l_apiary_site_id = 100;
					--  Create a new Site.
					insert into mal_site (
						licence_id,
						apiary_site_id,
						region_id,
						regional_district_id,
						status_code_id,
						address_line_1,							
						premises_id
						)
						values (
							l_licence_id,
							l_apiary_site_id,   
							l_file_rec.region_id,
							l_file_rec.regional_district_id,
							l_active_status_id,
							l_file_rec.site_address_line_1,
							l_file_rec.source_premises_id)
						returning id into l_site_id;
					-- Create a new Registrant
					insert into mal_registrant(
						first_name,
						last_name,
						primary_phone,
						secondary_phone,
						fax_number,
						email_address)
						values(
							l_file_rec.registrant_first_name,
							l_file_rec.registrant_last_name,
							l_file_rec.registrant_primary_phone,
							l_file_rec.registrant_secondary_phone,
							l_file_rec.registrant_fax_number,
							l_file_rec.registrant_email_address
							)
							returning id into l_registrant_id;
					-- Add a reference to the new Registrant on the new Licence
					update mal_licence
						set primary_registrant_id = l_registrant_id
					where id = l_licence_id;
					-- Add a row to the cross reference table for the new licence and registrant.
					insert into mal_licence_registrant_xref(
						licence_id,
						registrant_id)
						values(
							l_licence_id,
							l_registrant_id
							);
					l_process_comments  = concat(l_file_rec.process_comments, 
												 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
												' This row was successfully processed. ');
					-- Update the imported row with the new Licence info.
					update mal_premises_detail
					set import_status            = 'SUCCESS',
						licence_id               = l_licence_id,
						licence_number           = l_licence_number,
						site_id                  = l_site_id,
						apiary_site_id           = l_apiary_site_id,
						registrant_id            = l_registrant_id,
						licence_action           = 'INSERT',
						licence_status           = 'SUCCESS',
						site_action              = 'INSERT',
						site_status              = 'SUCCESS',
						process_comments         = l_process_comments,
						licence_status_timestamp = current_timestamp,
						site_status_timestamp    = current_timestamp
					where id = l_file_rec.id;
					l_num_db_inserts = l_num_db_inserts + 1;
	--  NEW_SITE (existing Licence)
				-- New Site on exixsting Licence
				elsif l_file_rec.import_action in ('NEW_SITE') then
					--  Determine if the Licence exists
					select id
					into l_licence_id
					from mal_licence
					where licence_number = l_file_rec.licence_number;
					if l_licence_id is not null then
						-- Determine the next sequential apiary Site ID
						select coalesce(max(apiary_site_id) + 1, 100)
						into l_apiary_site_id
						from mal_site
						where licence_id = l_licence_id;
						--  Create a new Site.
						insert into mal_site (
							licence_id,
							apiary_site_id,
							region_id,
							regional_district_id,
							status_code_id,
							address_line_1,							
							premises_id
							)
							values (
								l_licence_id,
								l_apiary_site_id,
								l_file_rec.region_id,
								l_file_rec.regional_district_id,
								l_active_status_id,
								l_file_rec.site_address_line_1,
								l_file_rec.source_premises_id)
							returning id into l_site_id;
						-- Update the Licence expiry date.
						update mal_licence
							set expiry_date = current_date + interval '2 years'
						where id = l_licence_id;
						l_process_comments  = concat(l_file_rec.process_comments, 
													 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
													' This row was successfully processed. ');
						-- Update the file row with the new IDs.
						update mal_premises_detail
						set import_status         = 'SUCCESS',
							licence_id            = l_licence_id,
							site_id               = l_site_id,
							apiary_site_id        = l_apiary_site_id,
							site_action           = 'INSERT',
							site_status           = 'SUCCESS',
							process_comments      = l_process_comments,
							site_status_timestamp = current_timestamp
						where id = l_file_rec.id;
						l_num_db_inserts = l_num_db_inserts + 1;
					else
						l_process_comments  = concat(l_file_rec.process_comments, 
													 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
													 ' The licence number ', l_licence_number, ' was not found in the Licence table. ');
						update mal_premises_detail
							set import_status    = 'NO_ACTION',
								process_comments = l_process_comments
							where id = l_file_rec.id;
						
					end if;
		--  UPDATE (Licence and Site)
				-- Process updates to licences and sites
				elsif l_file_rec.import_action in ('UPDATE') then
					select l.id, s.id
					into l_licence_id, l_site_id
					from mal_licence l
					left join mal_site s 
					on l.id = s.licence_id
					inner join mal_licence_type_lu t
					on l.licence_type_id = t.id
					inner join mal_status_code_lu st
					on s.status_code_id = st.id
					where t.licence_type = 'APIARY'
					and st.code_name = 'ACT'
					and l.licence_number = l_file_rec.licence_number
					and s.apiary_site_id = l_file_rec.apiary_site_id;
					if l_site_id is not null then
						update mal_licence
							set region_id            = l_file_rec.region_id,
								regional_district_id = l_file_rec.regional_district_id,
								company_name         = l_file_rec.licence_company_name,
								total_hives          = l_file_rec.licence_total_hives,
								mail_address_line_1  = l_file_rec.licence_mail_address_line_1,
								mail_address_line_2  = l_file_rec.licence_mail_address_line_2,
								mail_city            = l_file_rec.licence_mail_city,
								mail_province        = l_file_rec.licence_mail_province,
								mail_postal_code     = l_file_rec.licence_mail_postal_code,	
								issue_date           = current_date,
								expiry_date          = current_date + interval '2 years',
							    total_hives          = l_file_rec.licence_total_hives
							where id = l_licence_id;
						update mal_site
							set region_id            = l_file_rec.region_id,
								regional_district_id = l_file_rec.regional_district_id,
								address_line_1       = l_file_rec.site_address_line_1,
								premises_id          = l_file_rec.source_premises_id
							where id = l_site_id;	
						update mal_premises_detail
							set licence_id       = l_licence_id,
								site_id          = l_site_id,
								import_status    = 'SUCCESS',
								process_comments = concat(process_comments, 
														  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
														  'The Licence and Site were successfully updated.')
							where id = l_file_rec.id;
					l_num_db_updates = l_num_db_updates + 1;
					else
						update mal_premises_detail
							set import_status    = 'NO_ACTION',
								process_comments = concat(process_comments, 
														  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
														  'No data was found for the Licence Number and/or Apiary Site ID provided.')
							where id = l_file_rec.id;
					end if;
				--
				else
				-- The import action is invalid
					update mal_premises_detail
						set import_status    = 'NO_ACTION',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  'The information supplied on this row is not a valid request.')
						where id = l_file_rec.id;			
				end if;				
			exception
				when others then
	                get stacked diagnostics l_error_message = MESSAGE_TEXT;
					l_process_comments  = concat(l_file_rec.process_comments, 
												 to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss'), 
												' An error was made while processing this row. ');
					update mal_premises_detail
						set import_status    = 'ERROR',
							process_comments = concat(process_comments, 
													  to_char(current_timestamp, 'yyyy-mm-dd hh24:mi:ss '), 
													  l_error_sqlstate, ' ',
													  l_error_message, ' ',
													  l_error_context)
						where id = l_file_rec.id;
					commit;
			end;
		end loop;
	--	
	-- Capture existing process comments, in case this is not the first time this row was processed.
	case 
		when l_num_file_inserts = l_num_db_inserts
		 and l_num_file_updates = l_num_db_updates
		then iop_job_status = 'SUCCESS';
			 iop_process_comments = 'The rows were successfully processed.';
		else iop_job_status = 'WARNING'; 
			 iop_process_comments = 'One or more of the rows was not successfully processed. Check the mal_premises_detail table.';
	end case;
	-- Update the Job table.
	update mal_premises_job 
		set
			job_status              = iop_job_status,
			target_insert_count     = l_num_db_inserts,
			target_update_count     = l_num_db_updates,
			execution_end_time      = current_timestamp,
			execution_comment       = iop_process_comments,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
	-- 
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_process_premises_import(in int4, inout varchar, inout varchar) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_process_premises_import(in int4, inout varchar, inout varchar) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_process_premises_import(in int4, inout varchar, inout varchar) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_process_premises_import(in int4, inout varchar, inout varchar) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_start_dairy_farm_test_job(ip_job_type character varying, INOUT iop_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  begin
	-- Start a row in the  
	insert into mal_dairy_farm_test_job(
		job_source,
		job_status,
		execution_start_time,
		execution_end_time,
		source_row_count,
		target_insert_count,
		target_update_count,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	values(
		ip_job_type,
		'RUNNING',
		current_timestamp, 
		null,
		null,
		null,
		null,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp)
	returning id into iop_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_start_dairy_farm_test_job(in varchar, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_start_dairy_farm_test_job(in varchar, inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_start_dairy_farm_test_job(in varchar, inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_start_dairy_farm_test_job(in varchar, inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_start_premises_job(INOUT iop_premises_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  begin
	-- Start a row in the  
	insert into mal_premises_job(
		job_status,
		execution_start_time,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	values(
		'RUNNING',
		current_timestamp, 
		current_user,
		current_timestamp,
		current_user,
		current_timestamp)
	returning id into iop_premises_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_start_premises_job(inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_start_premises_job(inout int4) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_start_premises_job(inout int4) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_start_premises_job(inout int4) TO mals_app_role;

CREATE OR REPLACE PROCEDURE mals_app.pr_start_print_job(ip_print_category character varying, INOUT iop_print_job_id integer)
 LANGUAGE plpgsql
AS $procedure$
  begin
	-- Start a row in the mal_print_job table
	insert into mal_print_job(
		job_status,
		print_category,
		execution_start_time,
		json_end_time,
		document_end_time,
		certificate_json_count,
		envelope_json_count,
		card_json_count,
		renewal_json_count,
		dairy_infraction_json_count,
		report_json_count,
		create_userid,
		create_timestamp,
		update_userid,
		update_timestamp)
	values(
		'RUNNING',
		ip_print_category,
		current_timestamp, 
		null,
		null,
		0,
		0,
		0,
		0,
		0,
		0,
		current_user,
		current_timestamp,
		current_user,
		current_timestamp)
	returning id into iop_print_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_start_print_job(in varchar, inout int4) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_start_print_job(in varchar, inout int4) TO mals;

CREATE OR REPLACE PROCEDURE mals_app.pr_update_dairy_farm_test_results(ip_job_id integer, ip_source_row_count integer, INOUT iop_job_status character varying, INOUT iop_process_comments character varying)
 LANGUAGE plpgsql
AS $procedure$
  declare  
	l_target_insert_count     integer default 0;
	l_target_update_count  integer default 0;
  begin
	-- Update those columns which are derived from the inserted results.
	with src as (
		select * 
		from mal_dairy_farm_test_infraction_vw 
		where test_job_id = ip_job_id)
	update mal_dairy_farm_test_result tgt
	    set 
		    licence_id                           = src.licence_id,
		    spc1_date                            = src.spc1_date,
		    spc1_infraction_flag                 = src.spc1_infraction_flag,
		    spc1_previous_infraction_first_date  = src.spc1_previous_infraction_first_date,
		    spc1_previous_infraction_count       = src.spc1_previous_infraction_count,
			spc1_levy_percentage                 = src.spc1_levy_percentage,
			spc1_correspondence_code             = src.spc1_correspondence_code,
			spc1_correspondence_description      = src.spc1_correspondence_description,
		    scc_date                             = src.scc_date,
		    scc_infraction_flag                  = src.scc_infraction_flag,
		    scc_previous_infraction_first_date   = src.scc_previous_infraction_first_date,
		    scc_previous_infraction_count        = src.scc_previous_infraction_count,
			scc_levy_percentage                  = src.scc_levy_percentage,
			scc_correspondence_code              = src.scc_correspondence_code,
			scc_correspondence_description       = src.scc_correspondence_description,
		    cry_date                             = src.cry_date,
		    cry_infraction_flag                  = src.cry_infraction_flag,
		    cry_previous_infraction_first_date   = src.cry_previous_infraction_first_date,
		    cry_previous_infraction_count        = src.cry_previous_infraction_count,
			cry_levy_percentage                  = src.cry_levy_percentage,
			cry_correspondence_code              = src.cry_correspondence_code,
			cry_correspondence_description       = src.cry_correspondence_description,
		    ffa_date                             = src.ffa_date,
		    ffa_infraction_flag                  = src.ffa_infraction_flag,
		    ffa_previous_infraction_first_date   = src.ffa_previous_infraction_first_date,
		    ffa_previous_infraction_count        = src.ffa_previous_infraction_count,
			ffa_levy_percentage                  = src.ffa_levy_percentage,
			ffa_correspondence_code              = src.ffa_correspondence_code,
			ffa_correspondence_description       = src.ffa_correspondence_description,
		    ih_date                              = src.ih_date,
		    ih_infraction_flag                   = src.ih_infraction_flag,
		    ih_previous_infraction_first_date    = src.ih_previous_infraction_first_date,
		    ih_previous_infraction_count         = src.ih_previous_infraction_count,
			ih_levy_percentage                   = src.ih_levy_percentage,
			ih_correspondence_code               = src.ih_correspondence_code,
			ih_correspondence_description        = src.ih_correspondence_description
	    from src
	    where tgt.id = src.test_result_id;
		GET DIAGNOSTICS l_target_update_count = ROW_COUNT;
	-- Determine the process status.
	select count(licence_id)
	into l_target_insert_count
	from mal_dairy_farm_test_result
	where test_job_id = ip_job_id;
	iop_job_status := case 
                        when ip_source_row_count = l_target_update_count and 
                             ip_source_row_count = l_target_insert_count
                        then 'COMPLETE'
                        else 'WARNING'
                      end;
	iop_process_comments := concat( 'Source count: ', ip_source_row_count,
								   ', Insert count: ',l_target_insert_count,  
                                   ', Update count: ',l_target_update_count);
	-- Update the Job table.
	update mal_dairy_farm_test_job 
		set
			job_status              = iop_job_status,
			execution_end_time      = current_timestamp,
			source_row_count        = ip_source_row_count,
			target_insert_count     = l_target_insert_count,
			target_update_count     = l_target_update_count,
			update_userid           = current_user,
			update_timestamp        = current_timestamp
		where id = ip_job_id;
end; 
$procedure$
;

-- Permissions

ALTER PROCEDURE mals_app.pr_update_dairy_farm_test_results(in int4, in int4, inout varchar, inout varchar) OWNER TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_update_dairy_farm_test_results(in int4, in int4, inout varchar, inout varchar) TO public;
GRANT ALL ON PROCEDURE mals_app.pr_update_dairy_farm_test_results(in int4, in int4, inout varchar, inout varchar) TO mals;
GRANT ALL ON PROCEDURE mals_app.pr_update_dairy_farm_test_results(in int4, in int4, inout varchar, inout varchar) TO mals_app_role;


-- Permissions

GRANT ALL ON SCHEMA mals_app TO mals;
GRANT USAGE ON SCHEMA mals_app TO mals_app_role;
