## Tutorial

First of all, clone this repository.

```
git clone https://github.com/lets-fiware/node-red-contrib-NGSI-LD.git
```

Move current directory to `node-red-contrib-NGSI-LD/examples`.

```
cd node-red-contrib-NGSI-LD/examples
```

Create docker containers for the tutorial.

```
./service create
```

Start the containers

```
./service start
```

Open Node-RED using the URL: `http://<IP address:1880/`.
It is the IP address of your machine running the Docker engine.

To stop the containers, run the following command.

```
./service stop
```
