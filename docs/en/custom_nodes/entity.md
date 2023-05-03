# NGSI entity

This custom node is a simple node that allows to create, read or delete a NGSI-LD entity.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity/entity-01.png)

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Create an entity](#create-an-entity)
-   [Read an entity](#read-an-entity)
-   [Delete an entity](#delete-an-entity)

</details>

## Create an entity

It allows to create a NGSIv2 entity.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity/entity-02.png)

| Property    | Description                     |
| ----------- | ------------------------------- |
| Name        | A name for a node instance      |
| Broker      | An endpoint of a context broker |
| Action type | `create`                        |
| @context    | NGSI-LD @context                |

### Example

#### Input

payload *JSON Object*

A `msg.payload` should contain a NGSI-LD entity to create.

```
{
  "id": "urn:ngsi-ld:TemperatureSensor:001",
  "type": "TemperatureSensor",
  "category": {
    "type": "Property",
    "value": "sensor"
  },
  "temperature": {
    "type": "Property",
    "value": 25,
    "unitCode": "CEL"
  },
  "location": {
    "type": "GeoProperty",
    "value": {
      "type": "Point",
      "coordinates": [
        -73.975,
        40.775556
      ]
    }
  }
}
```

#### Output

statusCode *Number*

A `msg.statusCode` contains a status code.

```
201
```

## Read an entity

It allows to read a NGSI-LD entity.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity/entity-03.png)

| Property          | Description                                    |
| ----------------- | ---------------------------------------------- |
| Name              | A name for a node instance                     |
| Broker            | An endpoint of a context broker                |
| Action type       | `read`                                         |
| Representation    | `normalizaed`, `concise` or `keyValues`        |
| Entity id         | Id of the entity to retrieve                   |
| Attributes        | Comma separated list of attribute names        |
| System attrs      | `true` or `false`                              |
| Geometry property | GeoProperty Name                               |
| Language          | The preferred natural language of the response |
| Accept            | `JSON-LD`, `JSON` or `GeoJSON`                 |
| @context          | NGSI-LD @context                               |

### Examples

#### Input 1

payload *string*

A `msg.payload` should contain an entity Id to read the NGSI-LD entity.
A value of the payload may overwrite the entity id specified by property.

```
urn:ngsi-ld:Building:store001
```

#### Input 2

payload *JSON Object*

A `msg.payload` should contain a condition to read the NGSI-LD entity.
The values in the payload may overwrite properties.

| Name             | Data type | Description                                                         |
| ---------------- | --------- | ------------------------------------------------------------------- |
| entityId         | string    | Id of the entity to retrieve                                        |
| attrs            | string    | Comma separated list fo attribute names                             |
| representation   | string    | `normalizaed`, `concise` or `keyValues`                             |
| sysAttrs         | boolean   | `true` or `false`                                                   |
| geometryProperty | string    | GeoProperty Name                                                    |
| lang             | string    | The preferred natural language of the response                      |
| accept           | string    | `application/ld+json`, `application/json` or `application/geo+json` |

```
{
  "entityId": "urn:ngsi-ld:Building:store001",
  "attrs": "humidity",
  "representation": `keyValues`,
  "sysAttrs": true 
}
```

#### Output

payload *JSON Object*

A `msg.payload` contains the NGSI-LD entity.

```
{
  "id": "urn:ngsi-ld:TemperatureSensor:001",
  "type": "TemperatureSensor",
  "category": "sensor",
  "temperature": 25,
  "location": {
    "type": "Point",
    "coordinates": [
      -73.975,
      40.775556
    ]
  }
}
```

statusCode *Number*

A `msg.statusCode` contains a status code.

```
200
```

## Delete an entity

It allows to delete a NGSI-LD entity.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity/entity-04.png)

| Property    | Description                     |
| ----------- | ------------------------------- |
| Name        | A name for a node instance      |
| Broker      | An endpoint of a context broker |
| Action type | `delete`                        |
| Entity id   | Id of the entity to delete      |
| @context    | NGSI-LD @context                |

### Example

#### Input

payload *string* or *JSON Object*

A `msg.payload` should contain an id of the entity to delete the NGSI-LD entity.

```
urn:ngsi-ld:Building:store001
```

#### Output

statusCode *Number*

A `msg.statusCode` contains a status code.

```
204
```
