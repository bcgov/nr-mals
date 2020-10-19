@ECHO OFF

REM Execute as postgres
SET PGPASSWORD=%1

ECHO Delete previous log file
del create_mals_database_log.txt

ECHO Create MALS database, schema and role
psql -h localhost -U postgres -d postgres -p %2 -a -q -f .\sql\create_mals_database_01_db.sql > create_mals_database_log.txt
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\create_mals_database_02_schemas.sql >> create_mals_database_log.txt

pause
