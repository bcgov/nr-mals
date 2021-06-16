# Ministry of Agriculture Licencing System

## Running in OpenShift

This project uses the scripts found in [openshift-developer-tools](https://github.com/BCDevOps/openshift-developer-tools) to setup and maintain OpenShift environments (both local and hosted). Refer to the [OpenShift Scripts](https://github.com/BCDevOps/openshift-developer-tools/blob/master/bin/README.md) documentation for details.

**These scripts are designed to be run on the command line (using Git Bash for example) in the root `openshift` directory of your project's source code.**

## Running in a Local OpenShift Cluster

At times running in a local cluster is a little different than running in the production cluster.

Differences can include:

- Resource settings.
- Available image runtimes.
- Source repositories (such as your development repo).
- Etc.

To target a different repo and branch, create a `settings.local.sh` file in your project's local `openshift` directory and override the GIT parameters, for example;

```
export GIT_URI="https://github.com/bcgov/nr-mals.git"
export GIT_REF="openshift-updates"
```

Then run the following command from the project's local `openshift` directory:

```
genParams.sh -l
```

**Git Bash Note**: Ensure that you do not have a linux "oc" binary on your path if using Git Bash on a Windows PC to run the scripts. A windows "oc.exe" binary will work fine.

This will generate local settings files for all of the builds, deployments, and Jenkins pipelines.
The settings in these files will be specific to your local configuration and will be applied when you run the `genBuilds.sh` or `genDepls.sh` scripts with the `-l` switch.

### Important Local Configuration

Before you deploy your local build configurations...

The application uses .Net 3.0 s2i images for the builds.

## Deploying Your Project

All of the commands listed in the following sections must be run from the root `openshift` directory of your project's source code.

### Before You Begin...

If you are updating an existing environment you will need to be conscious of retaining access to the existing data in the given environment. User accounts, database names, and database credentials can all be affected. The processes affecting them should be reviewed and understood before proceeding.

For example, the process of deploying and managing database credentials has changed. The process has moved to using shared secrets that are mounted as environment variables, where previously they were provisioned as discrete environment variables in each component's environment. Further, the new deployment process, by default, will create a random set of credentials for each deployment or update (a new set every time you run `genDepls.sh`). Being that the credentials are shared, there is a single source and place that needs to be updated. You simply need to ensure the credentials are updated to the values expected by the pre-configured environment if needed.

### Initialization

If you are working with a new set of OpenShift projects, or you have run a `oc delete all --all` to start over, run the `initOSProjects.sh` script, this will repair the cluster file system services (in the Platform environment), and ensure the deployment environments have the correct permissions to deploy images from the tools project.

### Generating the Builds, Images and Pipelines in the Tools Project

Run the following script and follow the instructions:

```
genBuilds.sh
```

Note that the script will stop mid-way through. Ensure builds are complete in the tools project.

All of the builds should start automatically as their dependencies are available, starting with builds with only docker image and source dependencies.

The process of deploying the Jenkins pipelines will automatically provision a Jenkins instance if one does not already exist. This makes it easy to start fresh; you can simply delete the existing instance along with it's associated PVC, and fresh instances will be provisioned.

### Generate the Deployment Configurations and Deploy the Components

Run the following script for each of the environments (dev, test, prod) and follow the instructions to deploy the application components:

```
genDepls.sh -e <environmentName/>
```

#### Populate the resources for the UAT environment

The UAT environment exists alongside the TEST environment in the 30245e-test project. The resources for the TEST environment are populated in the previous step by running `genDepls.sh -e test`, but the UAT resources have to be added using the following commands:

```
oc project 30245e-test
oc process -f ../app/openshift/templates/mals-app-deploy-environment.json --param-file=../app/openshift/mals-app-deploy-environment.uat.param | oc apply -f -
```

### Set up Github Actions pipelines

1. Create a github-builder service account within OpenShift.
2. Provide the github-builder the image-builder role.
```
oc adm policy add-role-to-user system:image-builder system:serviceaccount:30245e-tools:github-builder -n 30245e-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-dev:default -n 30245e-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-test:default -n 30245e-tools
oc policy add-role-to-user system:image-puller system:serviceaccount:30245e-prod:default -n 30245e-tools
```
3. Create a new secret in OpenShift to be provided to GitHub as an API access token.
4. Add the secret to GitHub (https://github.com/bcgov/nr-mals/settings/secrets/actions) as OPENSHIFTTOKEN.
5. Additionally, a secret for the URL of the OpenShift cluster must be created, named as OPENSHIFTSERVERURL.
6. Create build.yml within nr-mals\github\workflows. A standard automated deployment script for deploying to DEV is as follows
```
name: Test & Deploy
on:
  push:
    paths:
      - "app/**/*"
defaults:
  run:
    working-directory: ./app
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@master
      - uses: actions/setup-node@master
        with:
          node-version: "12"
      - name: Install dependencies
        run: npm ci
      # - name: LINTing
        # run: npm run lint
      - name: Prettier
        run: npm run format:check
  s2i-build-dev:
    if: github.event_name == 'push' && github.repository == 'bcgov/nr-mals' && github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    needs: [test]
    steps:
      - name: S2I Build
        uses: redhat-developer/openshift-actions@v1.1
        with:
          version: "latest"
          openshift_server_url: ${{ secrets.OpenShiftServerURL}}
          parameters: '{"apitoken": "${{ secrets.OpenShiftToken }}", "acceptUntrustedCerts": "true"}'
          cmd: |
            'version'
            'start-build mals-app-dev --follow -n 30245e-tools'
```
7. GitHub will automatically recognize actions within MALS\.github\workflows and they will be viewable/runnable at https://github.com/bcgov/nr-mals/actions
