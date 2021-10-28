@echo off

echo Start of Script
 
echo 30245e-TOOLS
oc project 30245e-tools

rem oc delete rolebinding system:image-puller

oc delete pod patroni-11.13-1-build

oc delete build patroni-11.13-1

oc delete buildconfig patroni-11.13

oc delete imagestream patroni

oc delete imagestream postgres

echo End of Script