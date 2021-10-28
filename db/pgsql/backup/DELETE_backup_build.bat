@echo off

echo Start of Script

echo 30245e-TOOLS DELETE

oc project 30245e-tools

oc delete pod mals-backup-1-build
oc delete imagestream mals-backup
oc delete buildconfig mals-backup
 
echo End of Script
