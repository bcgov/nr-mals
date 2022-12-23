MALS Patroni Cluster Migration to the Spilo Cluster

The mals database was built using the templates on https://github.com/BCDevOps/platform-services
The database backups were built using the templates on https://github.com/BCDevOps/backup-container
    The backup routine is once per day, using pg_dump 
    The verification process failed as pg_dump does not support database roles

The mals database was migrated to a new cluster using the templates on https://github.com/bcgov/spilo-chart
    The spilo cluster offers daily base backups plus point in time recovery
    The default storage is PVC, and was changed to S3


Steps to create the Spilo cluster

    Request S3 storage
    Update values.yaml to use S3 storage 

    Manually create mals-dev-spilo-s3 secret to store the S3 keys, as referenced by the values.yaml file

    cd C:\<<path to git clone>>\git\nr-mals\spilo-db\openshift
        helm install mals-dev . --namespace 30245e-<<environment>> -f values-<<environment>>.yaml (dev, test, or prod)


Manually copy the five patroni-creds secret key/value pairs to the new mals-dev-spilo secret
    The passwords can be changed or replicated


Create the Spilo mals database and users

	oc port-forward mals-dev-spilo-0 <<local port>>:5432  (ie Dev:5442, Test:5452, Prod:5472)
    
    Update scripts to add environment specific information
        ./sql/spilo_01_db_and_users.sql
			create role mals with LOGIN PASSWORD '<<password>>';
			create role app_proxy_user with LOGIN PASSWORD '<<password>>';
        ./sql/spilo_02_dblink.sql
	        OPTIONS (host '<<Patroni cluster IP>>', port '5432', dbname 'mals');
	        OPTIONS (user 'mals', password '<<Patroni password>>');
    Execute the scripts via the batch file
        cd C:\Users\mikes\OneDrive\Documents\PARC\MALS\git\nr-mals\spilo-db\db-scripts\create-db
        create_mals_db.bat <<postgres password>> <<local port>> (per port-forward, ie Dev:5442, Test:5452, Prod:5472)


Migrate the database objects and data from the Patroni cluster to the Spilo cluster

	oc port-forward patroni-0 <<local port>>:5432 (ie Dev:5441, Test:5451, Prod:5471)
	oc port-forward mals-dev-spilo-0 <<local port>>:5432  (ie Dev:5442, Test:5452, Prod:5472)

    Update scripts to add environment specific information
        ./sql mals_migrate_02_seq_restart.sql
            Connect to Patroni cluster and generate the ALTER SEQUENCE - RESTART WITH statements
            Save the output to the file.

    Execute the scripts via the batch file
        cd C:\Users\mikes\OneDrive\Documents\PARC\MALS\git\nr-mals\spilo-db\db-scripts\create-db-objects
        create_mals_db_objects.bat <<postgres password>> <<local port>> (per port-forward, ie Dev:5442, Test:5452, Prod:5472)


Sample uninatall - dev

	uninstall the release
		helm uninstall -n 30245e-dev mals-dev --namespace 30245e-dev		
		oc delete configmap mals-dev-spilo-config
		oc delete configmap mals-dev-spilo-leader

	optionally delete the PVCs
		oc delete pvc/storage-volume-mals-dev-spilo-0
		oc delete pvc/storage-volume-mals-dev-spilo-1

    optionally delete the S3 backups (I used the free version of S3 Browser)
        delete /spilo

