# NGSI-LD

This custom node is a configuration node that allows to configure NGSI-LD broker and IdM.

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Properties](#properties)
-   [Identity manager type](#identity-manager-type)
    -   [None](#none)
    -   [Tokenproxy](#tokenproxy)
    -   [Keyrock](#keyrock)
    -   [Generic](#generic)

</details>

## Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/ngsi-ld-broker/ngsi-ld-broker-01.png)

| Property         | Description                                                                            |
| ---------------- | -------------------------------------------------------------------------------------- |
| name             | A name for a node instance                                                             |
| Broker type      | NGSI-LD broker type, either `Generic`, `Orion-LD`, `Scorpio`, `Stellio` or `STH-Comet` |
| Broker endpoint  | URL of API endpoint of NGSI-LD broker                                                  | 
| Mintaka endpoint | URL of API endpoint of Mintaka                                                         |
| @context         | NGSI-LD @context                                                                       |
| Tenant           | NGSI-LD tenant                                                                         |
| IdM Type         | Identity manager type, either `None`, `Tokenproxy`, `Keyrock`, or `Generic`            |

## Identity manager type

### None

Set `NONE` to `IdM Type` when not using any identity manager.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/ngsi-ld-broker/ngsi-ld-broker-02.png)

### Tokenproxy

Set `Tokenproxy` to `IdM Type` when using Tokenproxy. Then, set IdM Endpoint, Username and Password.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/ngsi-ld-broker/ngsi-ld-broker-03.png)

### Keyrock

Set `Keyrock` to `IdM Type` when using Keyrock. Then, set IdM Endpoint, Username, Password, Client ID and Client
Secret. 

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/ngsi-ld-broker/ngsi-ld-broker-04.png)

### Generic

Set `Generic` to `IdM Type` when using an generic identity manager. Then, set IdM Endpoint, Username, Password, Client
ID and Client Secret.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/ngsi-ld-broker/ngsi-ld-broker-05.png)
