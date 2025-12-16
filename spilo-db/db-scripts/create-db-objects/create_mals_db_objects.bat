@ECHO OFF

REM Execute as postgres
SET PGPASSWORD=%1

ECHO Delete previous log file
del create_mals_database_log.txt

ECHO Create MALS database objects and copy data from the Patroni cluster
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\mals_migrate_01_schema_objects.sql > mals_migrate_01_schema_objects.log
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\mals_migrate_02_seq_restart.sql > mals_migrate_02_seq_restart.log
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\mals_migrate_03_pre_data_load.sql > mals_migrate_03_pre_data_load.log
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\mals_migrate_04_data_load.sql > mals_migrate_04_data_load.log
psql -h localhost -U postgres -d mals -p %2 -a -q -f .\sql\mals_migrate_05_post_data_load.sql > mals_migrate_05_post_data_load.log

pause