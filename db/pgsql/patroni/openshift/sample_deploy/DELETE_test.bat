@echo off

echo Start of Script

echo 30245e-TEST
oc project 30245e-test

oc delete all -l cluster-name=patroni-test

oc delete sa patroni-test

oc delete secret,configmap,rolebinding,role -l cluster-name=patroni-test

oc delete networkpolicy allow-all-internal
oc delete networkpolicy allow-from-openshift-ingress
oc delete networkpolicy deny-by-default

echo WAIT 60 seconds before deleteing the storage to avoid PVC corruption errors
timeout 60

oc delete pvc postgresql-patroni-test-0
oc delete pvc postgresql-patroni-test-1
oc delete pvc postgresql-patroni-test-2
 
echo End of Script