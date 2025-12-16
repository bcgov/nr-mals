
SET search_path TO mals_app, public;

-- create a named connection to patroni
SELECT dblink_connect('my_patroni_connection', 'patroni_dblink_fdw');


/* 
	This insert did not mal_print_job_output on the initial migration execution. Created mals_migrate_04_data_load_v02.sql with theslast 6 insert statements.

	C:\Users\mikes\OneDrive\Documents\PARC\MALS\git\nr-mals\spilo-db\db-scripts\create-db-objects>create_mals_db_objects.bat TChavpzypmihTEmyvlC5JB42Ggu1rWos 5472
	Delete previous log file
	Could Not Find C:\Users\mikes\OneDrive\Documents\PARC\MALS\git\nr-mals\spilo-db\db-scripts\create-db-objects\create_mals_database_log.txt
	Create MALS database objects and copy data from the Patroni cluster
	psql:./sql/mals_migrate_04_data_load.sql:810: WARNING:  terminating connection because of crash of another server process
	DETAIL:  The postmaster has commanded this server process to roll back the current transaction and exit, because another server process exited abnormally and possibly corrupted shared memory.
	HINT:  In a moment you should be able to reconnect to the database and repeat your command.
	psql:./sql/mals_migrate_04_data_load.sql:810: SSL SYSCALL error: EOF detected
	psql:./sql/mals_migrate_04_data_load.sql:810: fatal: connection to server was lost
	psql: error: connection to server at "localhost" (::1), port 5472 failed: FATAL:  the database system is in recovery mode
	Press any key to continue . . .
*/

--  Increased the PVC sizes from 1gb to 2gb. Reran the insert over the dblink.

		insert into mals_app.mal_print_job_output 
		--
		select *
		from
		dblink(
		  'my_patroni_connection',
		  'select * from mals_app.mal_print_job_output') 
				as temp_t(
			id integer,
			print_job_id integer,
			licence_type varchar(100),
			licence_number varchar(30),
			document_type varchar(30),
			document_json json,
			document_binary bytea,
			create_userid varchar(63),
			create_timestamp timestamp,
			update_userid varchar(63),
			update_timestamp timestamp
		) ;
