# 3 tier microservices application deployment on Kubernetes
The following document will guide you through the steps to deploy a simple three-tier microservices based application on a kubernetes cluster on minikube and allow access to it from the internet. The application uses MongoDB for storage, Nodejs and Express for its backend server and React for the frontend. When you clone this repository you will see that it contains 4 folders. mongodb, server, log-app and ingress.

Using this application, one can create timestamped logs and retrieve them as needed. The application is kept as simple as possible as this task is more geared towards demonstrating how Kubernetes can be leveraged to deploy and scale applications. 

### Architecture Diagram
![System Architecture Diagram](https://github.com/tectonicpie/xgrid_kubernetes/blob/master/screenshots/Architecture%20Diagram.jpg?raw=true "System Architecture")

### MongoDB Setup
We will use a Persistent Volume (PV) and a Persistent Volume Claim (PVC) to create a storage resource in the Kubernetes cluster and to access it from our application. PVs are resources in the cluster which open a piece of available storage in the cluster. PVCs are requests for those resources and also act as claim checks to the resource. To create a PV, navigate to the MongoDB folder in the repo and open up the persistent-vol-server-app.yaml file. The two values to focus on are accessModes which is set to ReadWriteMany which means that multiple nodes can access this PV in parallel and Storage which defines the size of our storage volume. Create the PV with the following command

```
kubectl create -f persistent-vol-server-app.yaml
```

Now we will create a PVC which will allow our application to access this storage volume. Open up the persistent-vol-claim-server-app.yaml file and you will see that accessModes has been set to ReadWriteMany and Storage has been set to 1G. Claims use the same conventions as their persistent volumes. To create this claim, run the following command

```
kubectl create -f persistent-vol-claim-server-app.yaml
```

You can check to see whether the PV and PVC have been created by running the following command:

```
kubectl get pv,pvc,pod,svc
```

Once the PV and PVC have been created successfully, we can deploy mongoDB from its official image and create a service that will allow other pods to access and query the database. In  the mongodb-pod.yaml file, under spec, we have defined our storage with the persistentVolumeClaim we just created in the previous step. We have bound the ip to 0.0.0.0 as we would like to access it from a service resource. Furthermore have set resource thresholds and exposed port 27017 to allow access to the MongoDB pod from outside as well as defined an initcontainer that logs the ip of the MongoDB pod to the minikube host machine. We deploy this pod with the following command

```
kubectl create -f mongodb-pod.yaml
```

Lastly, we create a service resource which will allow other pods to interface with the MongoDB pod. The srvice is define in the mongodb-service.yaml file and can be create in the cluster using the following command

```
kubectl create -f mongodb-service.yaml
```

At this point, we have provisioned a PV, a PVC, a MongoDB pod and a service to access this pod. Therefore, we have a place to store data, a request to access the stored data, MongoDB which organizes, sets and retrieves data and a service which allows outside access to the MongoDB.

### Backend Setup
To create our applications backend server, we have used Nodejs running an Express server.

First we will create a configMap which will contain some key/value pairs that we will use later in the setup. This allows us to make our deployments customizable by specifying values in the configMap instead of specifying them in the docker image. We have created a configMap in the server folder of our repository called server-app-configs.yaml. In the server configMap, we can define the port where our Express server will be accessible and the url of the MongoDB service which we have created previously. To add this configMap we will use the following command:

```
kubectl create -f server-app-configs.yaml
```

Next we will create a docker image for the Nodejs application. In the Dockerfile we specify the package.json file, the src files, specify the container port and run yarn to install the required packages. The image can be created with the following command:

```
docker image build -t log-server-kubernetes-app:v10 .
```

Once the image has been created, we will create a deployment using this image. The deployment has been defined in the server-app-deploy.yaml file. In this file, we specify the name of this deployment, the image we intend to use, the port that this container will expose and the imagePullPolicy. We also specify resource limits and the configMap that we intend to use for this deployment. At this point we also have the option of creating multiple replicas of the backend server allowing us to increase our ability to handle incoming requests. We create this deployment in the cluster using the following command:

```
kubectl create -f server-app-deploy.yaml
```

Next, we will create a service of type loadBalancer which will allow other containers to communicate with our server. This service is defined in the server-app-service.yaml file where we specify the name of the service, the app which this service needs to expose and its port as well as the type of the service. We create this service by running the following command:

```
kubectl create -f server-app-service.yaml
```

At this point, we have created storage space, a mechanism to access that storage, a Nodejs application that connects to that storage, an Express server with a REST API Endpoints and a service which will allow a frontend application to access these endpoints.

### Frontend Setup
Similar to the Nodejs application, we will dockerize our React application. A Dockerfile is available in the log-app folder which specifies files to copy and packages to install to make the React app work. The Dockerfile also installs nginx in the same docker image and puts the build of the React app in the nginx /usr/share/nginx/html folder and opens up port 80 to allow access to this folder. We create this image by running the following command:

```
docker image build -t log-client-kubernetes-app .
```

Next we create a deployment set which is defined in the client-app-deploy.yaml file. It specifies the name of the deployment, the number of replicas, the image from which we want to create the deployment, the imagePullPolicy and sets resource limits. We create this deployment with the following command:

```
kubectl create -f client-app-deploy.yaml
```

Lastly, we will create a loadBalancer type service to distribute incoming traffic to replicas in the deployment. This service is defined in the client-app-service.yaml file and can be deployed with the following command:

```
kubectl create -f client-app-service.yaml
```

At this point, our three-tier application deployment is complete. Since we are using minikube, this deployment can be accessed from outside the cluster at minikube_ip:port_of_service. For React application the port will be the port exposed by the log-client-service whereas for the Nodejs application, it will be the port exposed by the log-server-service. Ensure that all deployments, pods, services, pvs and pvcs have been created and running successfully using the following:

```
kubectl get pv,pvc,pod,svc
```

### Ingress
Lastly, we will create an Ingress. An Ingress can be configured to give Services externally-reachable URLs, load balance traffic, and offer name based virtual hosting. An Ingress does not expose arbitrary ports or protocols. Our Ingress is defined in the ingress folder in the repository. We will use Name-based virtual hosts, routing HTTP traffic to multiple host names at the same IP address. This will allow us to expose both our React application and our Api Endpoints to the internet. To create this ingress resource run the following command: 

```
kubectl apply -f ingress-service.yaml
```

Now we can access our react application at logs.info as specified in the Ingress service and our nodejs application at logs.info/v2 without having to enter ip addresses of the minikube server or port numbers of our services.

 
[Complete screenshots of the deployment can be found here](https://drive.google.com/drive/folders/1Mcwb_x_lP1R7G2oyCF5GbNGqNTJ0-52e?usp=sharing)

Although we have created a simple three tier application with static storage and a scalable backend and frontend, there is still a lot that needs to be done that will make this application production ready. Some of these steps are defined below:
* Create mongodb deployment instead of static pod
* Create backend service replicas
* Use environment variables in backend and frontend instead of hardcoding urls
* Enable cors in express
* Use jwt in express
* Enable security policies for cluster
* Find a better place to log db ips
* Some sort of reporting infrastructure
