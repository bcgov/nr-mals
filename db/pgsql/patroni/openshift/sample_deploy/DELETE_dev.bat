@echo off

echo Start of Script

echo 30245e-DEV
oc project 30245e-dev

oc delete all -l cluster-name=patroni-dev

oc delete sa patroni-dev

oc delete secret,configmap,rolebinding,role -l cluster-name=patroni-dev

oc delete networkpolicy allow-all-internal
oc delete networkpolicy allow-from-openshift-ingress
oc delete networkpolicy deny-by-default

echo WAIT 60 seconds before deleteing the storage to avoid PVC corruption errors
timeout 60

oc delete pvc postgresql-patroni-dev-0
oc delete pvc postgresql-patroni-dev-1
oc delete pvc postgresql-patroni-dev-2
 
echo End of Script