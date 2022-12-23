@ECHO OFF

REM Execute as mals
REM Parameter 1 = Openshift secret app-db-owner-password
REM Parameter 2 = Current port-forward local port number
SET PGPASSWORD=%1

ECHO Create mals_app Tables
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_01_tables.sql >> create_mals_objects_log.txt

REM ECHO Create mals_app Lookup DML
REM psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_02_lookup_dml.sql >> create_mals_objects_log.txt

ECHO Create mals_app Views
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_03_views.sql >> create_mals_objects_log.txt

ECHO Create mals_app Foreign Keys
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_04_foreign_keys.sql >> create_mals_objects_log.txt

ECHO Create mals_app PLPGSQL
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_05_plpgsql.sql >> create_mals_objects_log.txt

ECHO Create mals_app Before Triggers
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_06_before_triggers.sql >> create_mals_objects_log.txt

ECHO Create mals_app Grants
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_07_grants.sql >> create_mals_objects_log.txt

ECHO Create mals_app Comments
psql -h localhost -U mals -d mals -p %2 -a -q -f .\sql\create_mals_08_comments.sql >> create_mals_objects_log.txt

pause
