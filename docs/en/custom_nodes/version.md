# FIWARE version 

This custom node is a simple node that allows to obtain the version information of NGSI-LD broker.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/version/version-01.png)

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Properties](#properties)
-   [Input](#input)
-   [Output](#output)

</details>

## Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/version/version-02.png)

| Property | Description                   |
| -------- | ----------------------------- |
| name     | A name for a node instance    |
| Broker   | An endpoint of NGSI-LD broker |

## Input

### Payload  *JSON Object*

A `msg.payload` should contain an empty JSON Object.

```
{}
```

## Output

### Payload *JSON Array*

A `msg.payload` contains the version information of NGSI-LD broker.

```
{
  "Orion-LD version": "1.1.2",
  "based on orion": "1.15.0-next",
  "kbase version": "0.8",
  "kalloc version": "0.8",
  "khash version": "0.8",
  "kjson version": "0.8.2",
  "microhttpd version": "0.9.75-0",
  "rapidjson version": "1.0.2",
  "libcurl version": "7.61.1",
  "libuuid version": "UNKNOWN",
  "mongocpp version": "1.1.3",
  "mongoc version": "1.22.0",
  "bson version": "1.22.0",
  "mongodb server version": "4.4.19",
  "boost version": "1_66",
  "openssl version": "OpenSSL 1.1.1k  FIPS 25 Mar 2021",
  "postgres libpq version": "15.0.0",
  "postgres server version": "12.0.6",
  "branch": "",
  "cached subscriptions": 0,
  "Next File Descriptor": 26
}
```
