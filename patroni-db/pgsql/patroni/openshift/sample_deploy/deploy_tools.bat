@echo off

echo Start of Script

echo 30245e-TOOLS DEPLOY

oc project 30245e-tools

oc process -f ../templates/build.yaml -p GIT_URI=https://github.com/bcgov/nr-mals | oc create -f -

echo End of Script
