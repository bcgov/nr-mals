@ECHO OFF

REM Execute as mals
SET PGPASSWORD=%1

ECHO Create mals_app Tables
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_01_tables.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Indexes
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_02_indexes.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Primary Keys
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_03_primary_keys.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Foreign Keys
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_04_foreign_keys.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Grants
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_05_grants.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Trigger Function
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_06_trigger_function.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Before Triggers
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_07_before_triggers.sql >> create_mals_fs-2_log.txt

ECHO Create mals_app Lookup DML
psql -h localhost -U mals -d mals -p 5434 -a -q -f .\sql\create_mals_fs-2_08_lookup_dml.sql >> create_mals_fs-2_log.txt

pause
