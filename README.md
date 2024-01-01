[![node-red-contrib-NGSI-LD Banner](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/node-red-contrib-ngsi-ld-non-free.png)](https://www.letsfiware.jp/)
[![NGSI LD](https://img.shields.io/badge/NGSI-LD-d6604d.svg)](https://www.etsi.org/deliver/etsi_gs/CIM/001_099/009/01.05.01_60/gs_CIM009v010501p.pdf)

[![platform](https://img.shields.io/badge/platform-Node--RED-red)](https://nodered.org)
[![NPM version](https://badge.fury.io/js/node-red-contrib-ngsi-ld.svg)](https://www.npmjs.com/package/node-red-contrib-ngsi-ld)
[![License: MIT](https://img.shields.io/npm/l/node-red-contrib-ngsi-ld)](https://opensource.org/licenses/MIT)
<br/>
[![Unit Tests](https://github.com/lets-fiware/node-red-contrib-NGSI-LD/actions/workflows/ci.yml/badge.svg)](https://github.com/lets-fiware/node-red-contrib-NGSI-LD/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/lets-fiware/node-red-contrib-NGSI-LD/badge.svg?branch=main)](https://coveralls.io/github/lets-fiware/node-red-contrib-NGSI-LD?branch=main)
[![E2E Tests](https://github.com/lets-fiware/node-red-contrib-NGSI-LD/actions/workflows/e2e.yml/badge.svg)](https://github.com/lets-fiware/node-red-contrib-NGSI-LD/actions/workflows/e2e.yml)
<br/>
[![GitHub Discussions](https://img.shields.io/github/discussions/lets-fiware/node-red-contrib-NGSI-LD)](https://github.com/lets-fiware/node-red-contrib-NGSI-LD/discussions)

# node-red-contrib-NGSI-LD

Node-RED implementation for NGSI-LD

| :books: [Documentation](https://node-red-contrib-ngsi-ld.letsfiware.jp/) | :dart: [Roadmap](./ROADMAP.md) |
|--------------------------------------------------------------------------|--------------------------------|

## Supported custom nodes

-   [NGSI-LD Entity](docs/en/custom_nodes/entity.md)
-   [NGSI-LD Entities](docs/en/custom_nodes/entities.md)
-   [NGSI-LD Entity attribute](docs/en/custom_nodes/entity-attribute.md)
-   [NGSI-LD Entity attributes](docs/en/custom_nodes/entity-attributes.md)
-   [NGSI-LD Batch operations](docs/en/custom_nodes/batch-operations.md)
-   [NGSI-LD Broker version](docs/en/custom_nodes/version.md)
-   [NGSI-LD Encode](docs/en/custom_nodes/encode.md)
-   [NGSI-LD Decode](docs/en/custom_nodes/decode.md)
-   [NGSI-LD Broker](docs/en/custom_nodes/ngsi-ld-broker.md)

## Documentation

-   [Documentation](https://node-red-contrib-ngsi-ld.letsfiware.jp/en)

## How to install

Run the following command on a command-line interface.

```
npm install node-red-contrib-ngsi-ld
```

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

## Source code

-   [https://github.com/lets-fiware/node-red-contrib-NGSI-LD](https://github.com/lets-fiware/node-red-contrib-NGSI-LD)

## Related links

-   [https://flows.nodered.org/node/node-red-contrib-ngsi-ld](https://flows.nodered.org/node/node-red-contrib-ngsi-ld)
-   [https://www.npmjs.com/package/node-red-contrib-ngsi-ld](https://www.npmjs.com/package/node-red-contrib-ngsi-ld)
-   [Open Source Insights](https://deps.dev/npm/node-red-contrib-ngsi-ld)

## Copyright and License

Copyright 2023-2024 Kazuhito Suda<br>
Licensed under the [MIT License](./LICENSE).
