# Udagram Image Filtering Microservice

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

The project is split into three parts:
1. [The Simple Frontend](/udacity-c3-frontend)
A basic Ionic client web application which consumes the RestAPI Backend. 
2. [The RestAPI Feed Backend](/udacity-c3-restapi-feed), a Node-Express feed microservice.
3. [The RestAPI User Backend](/udacity-c3-restapi-user), a Node-Express user microservice.

## Getting Setup

> _tip_: this frontend is designed to work with the RestAPI backends). It is recommended you stand up the backend first, test using Postman, and then the frontend should integrate.

### Installing Node and NPM
This project depends on Nodejs and Node Package Manager (NPM). Before continuing, you must download and install Node (NPM is included) from [https://nodejs.com/en/download](https://nodejs.org/en/download/).

### Installing Ionic Cli
The Ionic Command Line Interface is required to serve and build the frontend. Instructions for installing the CLI can be found in the [Ionic Framework Docs](https://ionicframework.com/docs/installation/cli).

### Installing project dependencies

This project uses NPM to manage software dependencies. NPM Relies on the package.json file located in the root of this repository. After cloning, open your terminal and run:
```bash
npm install
```
>_tip_: **npm i** is shorthand for **npm install**

### Setup Backend Node Environment
You'll need to create a new node server. Open a new terminal within the project directory and run:
1. Initialize a new project: `npm init`
2. Install express: `npm i express --save`
3. Install typescript dependencies: `npm i ts-node-dev tslint typescript  @types/bluebird @types/express @types/node --save-dev`
4. Look at the `package.json` file from the RestAPI repo and copy the `scripts` block into the auto-generated `package.json` in this project. This will allow you to use shorthand commands like `npm run dev`


### Configure The Backend Endpoint
Ionic uses enviornment files located in `./src/enviornments/enviornment.*.ts` to load configuration variables at runtime. By default `environment.ts` is used for development and `enviornment.prod.ts` is used for produciton. The `apiHost` variable should be set to your server url either locally or in the cloud.

***
### Running the Development Server
Ionic CLI provides an easy to use development server to run and autoreload the frontend. This allows you to make quick changes and see them in real time in your browser. To run the development server, open terminal and run:

```bash
ionic serve
```

### Building the Static Frontend Files
Ionic CLI can build the frontend into static HTML/CSS/JavaScript files. These files can be uploaded to a host to be consumed by users on the web. Build artifacts are located in `./www`. To build from source, open terminal and run:
```bash
ionic build
```
***

## Deployment using Kops
[udacity-c3-deployment](/udacity-c3-deployment) contains the necessary files used for the deployment. There's two repositories inside: 
* /docker: contains the docker-compose configurations for creating the reverseproxy container and the build specifications
* /k8s: contains all the kubernetes yaml used for deploying the pods and and the services

### Docker
The first step is to build the docker images needed by our services. Each services has their own Dockerfile. Each services are linked using the nginx reverseproxy. 

#### Configure AWS credentials
Before building our services images we need to define all AWS credentials as ENV variables. These credentials can be written into the file `~/.profile`as the following
```bash
export POSTGRESS_USERNAME= "<YOU_OWN_CONFIG_HERE>"
export POSTGRESS_PASSWORD= "<YOU_OWN_CONFIG_HERE>"
export POSTGRESS_DB= "<YOU_OWN_CONFIG_HERE>"
export POSTGRESS_HOST= "<YOU_OWN_CONFIG_HERE>"
export AWS_REGION= "<YOU_OWN_CONFIG_HERE>"
export AWS_PROFILE=default;
export AWS_BUCKET= "<YOU_OWN_CONFIG_HERE>"
export JWT_SECRET= "<YOU_OWN_CONFIG_HERE>"
```
Additionaly you'd want to export `AWS_ACCESS_KEY_ID`, `AWS_ACCESS_SECRET_KEY` and `AWS_SESSION_TOKEN` to get cli access to the different AWS ressources associated to your account.

#### Build services images using docker-compose
A convenient way to build the services images at once is to use docker-compose from within the [/udacity-c3-deployment/docker](/udacity-c3-deployment/docker) directory
```bash
docker-compose -f docker-compose-build.yaml build --parallel
```
Then deploy the image to the dockerhub registry
```bash
docker push <YOUR_DOCKER_HUB_ID>/reverseproxy
```

#### Create the kubernetes cluster using Kops
We assume that you have `kubectl` and [Kops](https://github.com/kubernetes/kops) installed. Also ensure that you have a public s3 bucket available on AWS. The bucket would allow us to save the state of our deployments. Additionally we'd use the `k8s.local` suffix for our cluster name to avoid setting up a real domain name for our cluster. A cluster will be created with a load-balancer pointing to our masters. Here's the command for creating the cluster:
```bash
kops create cluster \
       --state "s3://<YOUR_S3_BUCKET_NAME>" \
       --zones "us-east-1"  \
       --master-count 3 \
       --master-size=t2.micro \
       --node-count 2 \
       --node-size=t2.micro \
       --name our_cluset.k8s.local \
       --yes
```

#### Create the services in kubernetes
Next step is to create the different services using kops. 
Note that it is important to create the services before the deployment. From within [udacity-c3-deployment/k8s](/udacity-c3-deployment/k8s) run
```bash
kops create -f backend-user-service.yaml
kops create -f backend-feed-service.yaml
```
Then run the reverseproxy deployment
```bash
kops create -f reverseproxy-deployment.yaml
```
Finally check that the pods are running as expected using
```bash
kubectl get pod
```

### Docker images links on Dockerhub
* https://hub.docker.com/repository/docker/letsila/reverseproxy
* https://hub.docker.com/repository/docker/letsila/udacity-front-end
* https://hub.docker.com/repository/docker/letsila/udacity-restapi-feed
* https://hub.docker.com/repository/docker/letsila/udacity-restapi-user

