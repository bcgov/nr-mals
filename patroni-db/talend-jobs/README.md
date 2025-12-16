Data transformation from Oracle to Postgres is executed using Talend Open Studio.

	https://www.talend.com/products/talend-open-studio/

Openshift Command Line tool (oc) download.

	https://github.com/openshift/origin/releases

To import the MALS_2 Talend Project from your local Git repository;

	Start Talend.
	If this is the first time that you have executed Talend you will need to select a folder for your workspace.
	Select 'Import an existing project', then click 'Select'.
	Type the Project Name, ie 'MALS2'.
	Click 'Select archive file' then 'Browse' to the local Git repository;
		..\nr-mals\db\talend-jobs
	Select the archive 'MALS2.zip', then click 'Open' and you will be returned to the main Import dialogue box.
	Click 'Finish'. It will take several seconds to load the archive file.
		

Talend job execution requires invocation of port-forward using the Openshift Command Line tool (oc).

	OpenShift port-forwarding permits local client tools to connect to the OpenShift Postgres databases.
	Using different local ports for each environment helps to prevent accidentally updating the wrong database.
	Sample calls to match the above port numbers. Any available port can be used.

	DEV:  oc port-forward patroni-0      5441:5432
	TEST: oc port-forward patroni-0      5451:5432
	UAT:  oc port-forward patroni-uat-0  5461:5432
	PROD: oc port-forward patroni-0      5471:5432

Sample talend DEV connection with runtime connection parameters;

	MALS_Oracle_ServiceName                 : <<database service name>>
	MALS_Oracle_Port              (Default) : 1521 
	MALS_Oracle_Schema            (Default) : MALS 
	MALS_Oracle_Login             (Default) : mals 
	MALS_Oracle_Server                      : <<database server>>
	MALS_Oracle_Password                    : <<mals@malsdlvr password>>
	MALS_Oracle_AdditionalParams  (Default) : 

	MALS_PostgreSQL_Port                    : 5441
	MALS_PostgreSQL_Database      (Default) : mals     
	MALS_PostgreSQL_Password                : <<app-db-owner-password from patroni-dev secret>>
	MALS_PostgreSQL_Schema        (Default) : mals_app 
	MALS_PostgreSQL_Login         (Default) : mals     
	MALS_PostgreSQL_Server        (Default) : localhost
 
 The mal_dairy_farm_test_result job is not included in the main data load job as it was added late in the project. For performance reasons, the job requires that the unique constraints be dropped before the data load and recreated after the data load. This manual step is required as the pre and post steps in the Talend job were not working as desired. 
 

	ALTER TABLE mal_dairy_farm_test_result DROP CONSTRAINT  mal_dryfrmtst_irmaspc1_uk;
	ALTER TABLE mal_dairy_farm_test_result DROP CONSTRAINT mal_dryfrmtst_irmascc_uk;
	ALTER TABLE mal_dairy_farm_test_result DROP CONSTRAINT mal_dryfrmtst_irmacry_uk;
	ALTER TABLE mal_dairy_farm_test_result DROP CONSTRAINT mal_dryfrmtst_irmaffa_uk;
	ALTER TABLE mal_dairy_farm_test_result DROP CONSTRAINT mal_dryfrmtst_irmaih_uk;

		execute mal_dairy_farm_test_result job

	ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmaspc1_uk UNIQUE (irma_number, test_year, test_month, spc1_day);
	ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmascc_uk UNIQUE (irma_number, test_year, test_month, scc_day);
	ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmacry_uk UNIQUE (irma_number, test_year, test_month, cry_day);
	ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmaffa_uk UNIQUE (irma_number, test_year, test_month, ffa_day);
	ALTER TABLE mal_dairy_farm_test_result ADD CONSTRAINT mal_dryfrmtst_irmaih_uk UNIQUE (irma_number, test_year, test_month, ih_day);
