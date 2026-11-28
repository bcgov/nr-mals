<!--
BC Notify email template for the Spilo backup notification CronJob
(spilo-db/openshift/templates/backup-notification.yaml).

Template ID: 09757613-f9fb-401e-adf4-520f347431ba
Engine:      mustache
Body type:   markdown

Copy the subject and body below into the template in Notify. Every placeholder
must be supplied by the sender; the CronJob always sends all of them.
-->

## Subject

```
[{{environment}}] MALS database backup {{status}}
```

## Body

```
# MALS database backup {{status}}

> {{summary}}

{{#failed}}
**Action needed:** the nightly backup did not complete as expected. Check the Spilo database pods and the backup notification job logs in the {{namespace}} OpenShift project.
{{/failed}}

---

## Backup details

- **Environment:** {{environment}}
- **Latest backup:** {{backupName}}
- **Finished:** {{finishedAt}}
- **Size:** {{backupSize}}
- **Backups retained:** {{backupCount}}
- **Checked:** {{checkedAt}}

---

This message was sent automatically by the {{jobName}} job in the {{namespace}} OpenShift project. Do not reply to this email.
```

## Parameters

| Name | Type | Example |
|---|---|---|
| `environment` | string | `MALS (prod)` |
| `status` | string | `succeeded` / `FAILED` |
| `summary` | string | `The nightly base backup completed and was uploaded to object storage.` |
| `failed` | boolean | `false` |
| `backupName` | string | `base_0000007A0000002600000011` (`-` if the backup list cannot be read) |
| `finishedAt` | string | `2026-11-27 01:00 PST (09:00 UTC)` |
| `backupSize` | string | `1503 MB compressed (1779 MB raw)` |
| `backupCount` | string | `17` |
| `checkedAt` | string | `2026-11-27 01:30 PST (09:30 UTC)` |
| `jobName` | string | `mals-prod-spilo-backup-notify` |
| `namespace` | string | `30245e-prod` |
