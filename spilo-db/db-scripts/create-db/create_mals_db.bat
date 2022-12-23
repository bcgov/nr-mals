@ECHO OFF

REM Execute as postgres
SET PGPASSWORD=%1

ECHO Delete previous log file
del create_mals_database_log.txt

ECHO Create MALS database, schema and role
psql -h localhost -U postgres -d postgres -p %2 -a -q -f .\sql\spilo_01_db_and_users.sql > spilo_01_db_and_users.log
ECHO Create the database link to the Patroni cluster
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\spilo_02_dblink.sql > spilo_02_dblink.log
ECHO Create the mals_app schema in the mals database
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\spilo_03_schema.sql > spilo_03_schema.log

pause