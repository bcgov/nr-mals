# MALS Database (Spilo)

The MALS database runs as a Spilo (Patroni) PostgreSQL cluster, deployed with the Helm chart in [openshift/](openshift/). The release in each environment is `mals-<env>` and the StatefulSet is `mals-<env>-spilo`.

## Database backups

### How backups work

Spilo uses [wal-g](https://github.com/wal-g/wal-g) to back up to the NRS object storage (S3, `nrs.objectstore.gov.bc.ca`):

- **Continuous WAL archiving:** every completed write-ahead log segment is uploaded as it is written. This makes point-in-time recovery possible between base backups.
- **Daily base backup:** a full copy of the database, taken by a cron job inside the Spilo leader pod.
- **Retention:** each run deletes base backups older than the retention period while always keeping at least that many backups.

| Environment | Namespace | Base backup (UTC) | Pacific (PST) | Base backups retained | Bucket |
|---|---|---|---|---|---|
| dev | 30245e-dev | 17:45 | 9:45 am | 5 | dyeycx |
| test | 30245e-test | 09:00 | 1:00 am | 5 | ekffvi |
| prod | 30245e-prod | 09:00 | 1:00 am | 15 | baqmeq |

Add an hour for Pacific daylight time. The schedule, retention and bucket are set in `continuousArchive` in [openshift/values-&lt;env&gt;.yaml](openshift/). The S3 credentials are in the `mals-<env>-spilo-s3` secret; test uses `mals-dev-spilo-s3`.

Backups are stored under `s3://<bucket>/spilo/<namespace>-mals-<env>-spilo/wal/14/`.

To list the backups, run this in the leader pod (the pod labelled `spilo-role=master`):

    oc exec -n 30245e-<env> <leader pod> -- envdir /run/etc/wal-e.d/env wal-g backup-list --detail

> The older `backup-mals` DeploymentConfig (templates in `patroni-db/pgsql/backup`) still runs nightly `pg_dump` backups, but only of the retired `patroni` database, not the live Spilo database.

### Backup notifications

A CronJob, `mals-backup-notify`, checks the backups about 30 minutes after each base backup and emails the result through [BC Notify](https://notify.digital.gov.bc.ca). An email is sent on every run:

- **succeeded:** the newest base backup finished within the last 2 hours.
- **FAILED:** there is no base backup in the last 2 hours, or the backups in S3 could not be read. The job is also marked failed in OpenShift.

The email includes the backup name, finish time, size and the number of backups retained. The job runs as a separate pod rather than inside Spilo, so it still reports a failure when a backup never ran at all.

| Environment | Notification (UTC) |
|---|---|
| dev | 18:30 |
| test | 09:30 |
| prod | 09:30 |

The chart is in [backup-notify/](backup-notify/). All environments send through Notify's production environment.

#### Recipients and API key

Recipients and the Notify API key are in a secret named `mals-backup-notify` in each namespace. This chart doesn't create the secret; it is managed by hand:

| Key | Value |
|---|---|
| `NOTIFY_API_KEY` | BC Notify API key |
| `NOTIFY_RECIPIENTS` | Comma-separated email addresses, e.g. `a@gov.bc.ca,b@gov.bc.ca` |

The job reads the secret each time it runs, so **changing recipients or the key takes effect on the next run, with no deployment**. To replace the recipient list:

    oc patch secret mals-backup-notify -n 30245e-<env> --type merge \
      -p '{"stringData":{"NOTIFY_RECIPIENTS":"a@gov.bc.ca,b@gov.bc.ca"}}'

You can also edit the secret in the OpenShift console (Workloads → Secrets → `mals-backup-notify` → Edit Secret).

To create the secret in a new environment (prompts for the key without echoing it, in zsh):

    read -rs "NOTIFY_API_KEY?Notify API key: "; echo
    oc create secret generic mals-backup-notify -n 30245e-<env> \
      --from-literal=NOTIFY_API_KEY="$NOTIFY_API_KEY" \
      --from-literal=NOTIFY_RECIPIENTS='a@gov.bc.ca'
    unset NOTIFY_API_KEY

#### Email template

The email uses a stored Notify template (ID `09757613-f9fb-401e-adf4-520f347431ba`, mustache engine). A copy of the subject, body and parameters is in [backup-notify/notify-template.md](backup-notify/notify-template.md). Edits made to the template in Notify take effect on the next run; keep the copy in this repo in step.

#### Deployment

The GitHub Actions workflow **Backup Notification** (`.github/workflows/backup-notify.yml`) deploys the chart:

- **On merge to master** with changes under `spilo-db/backup-notify/`: dev, then test, then prod. Test and prod need approval, as for app deployments.
- **Manually:** Actions → Backup Notification → Run workflow, then choose the environment.

The workflow only deploys `spilo-db/backup-notify`, never the Spilo database chart. It stops if the `mals-backup-notify` secret is missing.

To deploy by hand instead:

    cd spilo-db/backup-notify
    helm upgrade --install mals-backup-notify . -n 30245e-<env> -f values-<env>.yaml

Changing the schedule, the 2-hour limit or the script means changing this chart and deploying it. Recipients and the API key don't (see above).

#### Testing and troubleshooting

Run the check now instead of waiting for the schedule:

    oc create job --from=cronjob/mals-backup-notify backup-notify-test -n 30245e-<env>
    oc logs -f job/backup-notify-test -n 30245e-<env>
    oc delete job backup-notify-test -n 30245e-<env>

A manual run more than 2 hours after the day's base backup reports FAILED; this is expected. A successful send logs `Notify responded HTTP 202`. If the pod doesn't start, check that the `mals-backup-notify` secret has both keys.

---

## Patroni to Spilo migration (history)

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

    Manually create mals-<<environment>>-spilo-s3 secret to store the S3 keys, as referenced by the values.yaml file

    cd C:\<<path to git clone>>\git\nr-mals\spilo-db\openshift
        helm install mals-<<environment>> . --namespace 30245e-<<environment>> -f values-<<environment>>.yaml (dev, test, or prod)


Manually add password key/value pairs to the new mals-<<environment>>-spilo secret;

    Generate new 32 character passwords
       https://cloud.google.com/network-connectivity/docs/vpn/how-to/generating-pre-shared-key
	   
	Add key/value pairs to mals-<<environment>>-spilo secret;
	   app-db-owner-password
	   app-proxy-password


Create the Spilo mals database and users

	oc port-forward mals-<<environment>>-spilo-0 <<local port>>:5432  (ie Dev:5442, Test:5452, Prod:5472)
    
    Update scripts to add environment specific information
        ./sql/spilo_01_db_and_users.sql
			create role mals with LOGIN PASSWORD '<<password>>';
			create role app_proxy_user with LOGIN PASSWORD '<<password>>';
        ./sql/spilo_02_dblink.sql
	        OPTIONS (host '<<Patroni Pod-0 IP>>', port '5432', dbname 'mals');
	        OPTIONS (user 'mals', password '<<Patroni password>>');
    Execute the scripts via the batch file
        cd C:\Users\mikes\OneDrive\Documents\PARC\MALS\git\nr-mals\spilo-db\db-scripts\create-db
        create_mals_db.bat <<postgres password>> <<local port>> (per port-forward, ie Dev:5442, Test:5452, Prod:5472)


Migrate the database objects and data from the Patroni cluster to the Spilo cluster

	oc port-forward patroni-0 <<local port>>:5432 (ie Dev:5441, Test:5451, Prod:5471)
	oc port-forward mals-<<environment>>-spilo-0 <<local port>>:5432  (ie Dev:5442, Test:5452, Prod:5472)

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

