

@echo off

echo Start of Script

echo 30245e-NETWORK POLICY TEST DEPLOY

oc project 30245e-test
	
oc process -f ../templates/quickstart.yaml -n 30245e-test -p NAMESPACE_PREFIX=30245e -p ENVIRONMENT=test | oc create -f -
echo End of Script
