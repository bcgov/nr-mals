# Source & Credit
Copied from https://github.com/BCDevOps/devops-platform-workshops-labs
where they Contributed to and copied from https://github.com/zalando/patroni

# Patroni OpenShift Configuration
Patroni can be run in OpenShift. Based on the kubernetes configuration, the Dockerfile and Entrypoint has been modified to support the dynamic UID/GID configuration that is applied in OpenShift. This can be run under the standard `restricted` SCC. 

# Examples

## Build the image in your tools namespace

``` bash
oc process -f openshift/build.yaml \
 -p GIT_URI=https://github.com/{gitUserName}/devops-platform-workshops-labs \
 -p VERSION=v10-latest | oc apply -f - -n {namespace}-tools
```

Once the build has completed, you can tag this build as stable as well

``` bash
oc tag patroni:v10-latest patroni:v10-stable -n [projectname]-tools
```

## Create an environment file to hold parameters
You will need to pass parameters to the templates and an easy way to make sure your variables are tracked is to have an environment file for each namespace or deployment.

eg:

``` bash
cat << EOT > dev.env
NAME=patroni
IMAGE_STREAM_TAG=patroni:v10-latest
PVC_SIZE=1Gi
APP_DB_NAME=grafana
APP_DB_USERNAME=grafana
EOT
```

## Deploy the templates

The template doesn't have a guaranteed order, so the secrets object will need to be created before the main template is applied.

``` bash
oc project {namespace-dev}
oc process -f openshift/deployment-prereq.yaml \
  --param-file=dev.env --ignore-unknown-parameters=true \
  | oc apply -f -

oc process -f openshift/deployment.yaml \
  --param-file=dev.env --ignore-unknown-parameters=true \
  | oc apply -f -
```

#### Accessing the image

If your image is referencing another private namespace, you will need to add the created ServiceAccount to the image namespace with the `system:image-puller` role.

``` bash
oc policy add-role-to-user system:image-puller system:serviceaccount:{deploymentNamespace}:patroni \
  -n {ImageSourceNamespace}
```

Alternatively, you can export and tag your image from your -tools project after each build.

## Clean Everything

``` bash
oc delete all -l cluster-name=patroni
oc delete secret,configmap,rolebinding,role -l cluster-name=patroni
```

*Note: The above will NOT remove your PVCs or the manual rolebindings in the -tools project.*

Once the pods are running, two configmaps should be available: 

``` bash
$ oc get configmap
NAME                DATA      AGE
patroniocp-config   0         1m
patroniocp-leader   0         1m
```
