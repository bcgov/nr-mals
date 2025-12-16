@ECHO OFF

REM Execute as postgres
SET PGPASSWORD=%1

ECHO Delete previous log file
del drop_mals_database_log.txt

ECHO Drop database if it exists
psql -h localhost -U postgres -d postgres -p %2 -a -q -f .\sql\drop_mals_database_01_kill_sessions.sql > drop_mals_database_log.txt
psql -h localhost -U postgres -d postgres -p %2 -a -q -f .\sql\drop_mals_database_02_db.sql >> drop_mals_database_log.txt

pause
