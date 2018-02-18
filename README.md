# Canteen.

A decentralized container orchestrating system (Kubernetes), running on Ethereum. 

The modern tech startup/enterprise is comprised of tens or hundreds or even thousands of crucial technical components such as databases, backends, replicas of databases, stream processing platforms, etc.

These extremely sensitive moving components comprise a company's tech stack; typically living distributed amongst a cluster of servers.

Should any of these moving components go down due to minor faults, a company could go completely unoperational resulting in hundreds of thousands dollars lost in practice. Imagine the stock exchange's database going down for even a hour!

Large tech giants such as Google aim to solve this problem by introducing a new tech component to their tech stack: a container orchestrator.

A container orchestrator efficiently distributes containerized tech components given a set of servers to maximize a tech components performance and utilization of computational resources, and supervises each and every tech components lifecycle to ensure they get restarted or backed up should anything ever go wrong with the component.

Google's decades of work led to a container orchestration platform popularly used in thousands of companie so worldwide known as Kubernetes. Other solutions prior to Kubernetes have existed such as the extremely famous Apache DC/OS.

As good as this may sound though, what are the disadvantages to employing a container orchestrator in a company's tech stack?

* A container orchestrator remains to be a single source of potential failure for an entire distributed tech stack. If Kubernetes goes down, the tech stack may potentially remain dysfunctional.

* A container orchestrator is typically extremely complicated, requires large amounts of configuration, and requires other technical components running in the stack (Kubernetes uses a configuration database known as etcd. which has its own set of scaling problems).

* A container orchestrator is heavy and requires a large number of computational resources.


## Introducing Canteen

Canteen is an extremely scalable container orchestrator that is fault-tolerant, easy to install, easy to distribute, and most importantly decentralized through the utility of an Ethereum smart contract.

Canteen efficiently schedules and orchestrates designated Docker containers to a set of servers based on speculated/provisioned container resource limits.


## Installing Canteen

All you need to do to have canteen work with your tech stack is have your tech components in a Docker container uploaded on Docker Hub.

Deploy the smart contract on whatever chain supports the Ethereum Virtual Machine, and edit the configuration of canteen's node file to point to the smart contract and chain.

Run canteen's node on your set of servers and register your Docker images on the smart contract.

Canteen will then orchestrate your Docker containers based on all registered server node resource limitations and keep your entire tech stack fault tolerant and decentralized!

canteen can even replicate Docker containers to any amount of servers you choose should you wish to keep replicas of your database/web server/etc. on your cluster of servers.

## Specifications

Given that this was made for a 36-hour hackathon, we only implemented a priority-based Round-robin scheduling mechanism for choosing a set of servers to deploy a set of Docker images to.

Each canteen node uses the SWIM protocol off-chain to determine the liveliness of all servers to efficiently schedule Docker containers to healthy servers. Should a server go down, images will be minimally rescheduled to ensure minimal product/service downtime.


