@echo off

echo Start of Script

echo 30245e-TOOLS DEPLOY

oc project 30245e-tools

oc process --param-file=backup-build.param -f backup-build.yaml  | oc -n 30245e-tools create -f -
  
echo End of Script
