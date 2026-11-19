----
-- MALS2-124 - Apiary inspection details at the licence level
--   * New lookup table for apiary inspection type (Extension, Sales, Movement)
--   * New inspection_type_id and varroa_avg_yard columns on mal_apiary_inspection
----

--
-- TABLE:  MAL_APIARY_INSPECTION_TYPE_LU
--

CREATE TABLE mals_app.mal_apiary_inspection_type_lu (
	id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
	code_name varchar(50) NOT NULL,
	code_description varchar(120) NULL,
	active_flag bool NOT NULL DEFAULT true,
	create_userid varchar(63) NOT NULL,
	create_timestamp timestamp NOT NULL,
	update_userid varchar(63) NOT NULL,
	update_timestamp timestamp NOT NULL,
	CONSTRAINT mal_apiary_inspection_type_lu_pkey PRIMARY KEY (id),
	CONSTRAINT mal_apinsptyp_code_name_uk UNIQUE (code_name)
);

-- Table Triggers

CREATE TRIGGER mal_trg_apiary_inspection_type_lu_biu before
INSERT OR UPDATE ON mals_app.mal_apiary_inspection_type_lu
  FOR EACH ROW EXECUTE FUNCTION mals_app.fn_update_audit_columns();

-- Permissions

ALTER TABLE mals_app.mal_apiary_inspection_type_lu OWNER TO mals;
GRANT ALL ON TABLE mals_app.mal_apiary_inspection_type_lu TO mals;
GRANT UPDATE, SELECT, DELETE, INSERT ON TABLE mals_app.mal_apiary_inspection_type_lu TO mals_app_role;

-- Seed values

INSERT INTO mals_app.mal_apiary_inspection_type_lu
	(code_name, code_description, active_flag, create_userid, create_timestamp, update_userid, update_timestamp)
VALUES
	('EXTENSION', 'Extension', true, current_user, current_timestamp, current_user, current_timestamp),
	('SALES',     'Sales',     true, current_user, current_timestamp, current_user, current_timestamp),
	('MOVEMENT',  'Movement',  true, current_user, current_timestamp, current_user, current_timestamp);

--
-- TABLE:  MAL_APIARY_INSPECTION - new columns
--

ALTER TABLE mals_app.mal_apiary_inspection
	ADD COLUMN inspection_type_id int4 NULL,
	ADD COLUMN varroa_avg_yard numeric(5,2) NULL;

ALTER TABLE mals_app.mal_apiary_inspection
	ADD CONSTRAINT apinsp_apinsptyp_fk FOREIGN KEY (inspection_type_id)
	REFERENCES mals_app.mal_apiary_inspection_type_lu(id);

-- Licence-level inspection lookups join site -> inspection
CREATE INDEX IF NOT EXISTS mal_apiary_inspection_site_id_idx
	ON mals_app.mal_apiary_inspection (site_id);
