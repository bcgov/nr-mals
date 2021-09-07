-- Connecting to Postgres and executing SQL statements to create the database and objects.
-- These examples below use two Windows command shells.
-- The database passwords are stored in the patroni-creds (secret, patroni-uat for UAT)

-- Openshift Command Line tool (oc) download

	https://github.com/openshift/origin/releases
	
-- The superuser-password and app-db-owner-password are stored in the OpenShift secret for each environment.

		30245e-dev  = patroni 
		30245e-test = patroni  and patroni-uat (no backup/recovery)
		30245e-prod = patroni
	
-- CMD Shell 1

1.  Invoke port-forward to map your local host to the pod's listening port.

        oc port-forward <<pod name>> <<local port>>:<<pod port>>
		
		-- Example using local port 5441 so as not to conflict with a local Postgres database that is listening on 5432.
		
		oc project 30245e-dev
		oc port-forward patroni-0 5441:5432		

-- CMD Shell 2

2.  Optional - drop the existing database. 

        drop_mals_database.bat <<superuser-password>> <<port-forward port number>>
		
		-- Example
        cd C:\temp\GitHub\nr-mals\db\pgsql\db-scripts\drop-database
        drop_mals_database.bat ABCDEFGHIJ1234567890abcdefghij12 5441

3.  Create the database

        create_mals_database.bat <<superuser-password>> <<port-forward port number>>
		
		-- Example
        cd C:\temp\GitHub\nr-mals\db\pgsql\db-scripts\create-database
        create_mals_database.bat ABCDEFGHIJ1234567890abcdefghij12 5441
		
	or the objects of an individual Feature Set. 
		
        create_mals_fs-2.bat <<app-db-owner-password>> <<port-forward port number>>
		
		-- Example
        cd C:\temp\GitHub\nr-mals\db\pgsql\db-scripts\create-fs-2
        create_mals_objects.bat ABCDEFGHIJ1234567890abcdefghij12 5441
