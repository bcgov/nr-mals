Data transformation from Oracle to Postgres is executed using Talend Open Studio.

	https://www.talend.com/products/talend-open-studio/

Openshift Command Line tool (oc) download.

	https://github.com/openshift/origin/releases

Requires invocation of port-forward using the Openshift Command Line tool (oc).

	OpenShift port-forwarding permits local client tools to connect to the OpenShift Postgres databases.
	Sample calls to match the above port numbers. Any available port can be used;


	DEV:  oc port-forward patroni-dev-0 5440:5432
	TEST: oc port-forward patroni-dev-0 5450:5432
	UAT:  oc port-forward patroni-dev-0 5460:5432
	PROD: oc port-forward patroni-dev-0 5470:5432

Sample talend DEV connection with runtime connection parameters;

	MALS_Oracle_ServiceName                 : maldlvr1.nrs.bcgov
	MALS_Oracle_Port              (Default) : 1521 
	MALS_Oracle_Schema            (Default) : MALS 
	MALS_Oracle_Login             (Default) : mals 
	MALS_Oracle_Server                      : nrcdb02.bcgov
	MALS_Oracle_Password                    : <<mals@malsdlvr password>>
	MALS_Oracle_AdditionalParams  (Default) : 

	MALS_PostgreSQL_Port                    : 5440
	MALS_PostgreSQL_Database      (Default) : mals     
	MALS_PostgreSQL_Password                : <<app-db-owner-password from patroni-dev secret>>
	MALS_PostgreSQL_Schema        (Default) : mals_app 
	MALS_PostgreSQL_Login         (Default) : mals     
	MALS_PostgreSQL_Server        (Default) : localhost


Import the Contexts prior to importing ant FS jobs. The contexts are referenced/required by all of the jobs.
 