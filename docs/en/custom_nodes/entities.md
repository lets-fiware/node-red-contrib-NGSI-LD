# NGSI-LD entities

This custom node is a simple node that allows to obtain NGSI-LD entities.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entities/entities-01.png)

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Properties](#properties)
-   [Input](#input)
-   [Output](#output)

</details>

## Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entities/entities-02.png)


| Property               | Description                                                 |
| ---------------------- | ----------------------------------------------------------- |
| Name                   | A name for a node instance                                  |
| Broker                 | An endpoint of a context broker                             |
| Representation         | `normalized`, `concise` or `keyValues`                      |
| Entity id              | Id of the entity to retrieve                                |
| Entity type            | Types of the entity to retrieve                             |
| ID pattern             | Regular expression that shall be matched by entity ids      |
| Attributes             | Comma separated list fo attribute names                     |
| System attrs           | `true` or `false`                                           |
| Query                  | Filter out entities by attribute values                     |
| CSF                    | Context source fileter                                      |
| Geo relationship       | Geo relationship of geoquery                                |
| Geometry               | Geometry of geoquery                                        |
| Coordinates            | Coordinates of geoquery                                     |
| Geo property           | The name of the Property that contains the geospatial data  |
| Geometry property      | GeoProperty Name                                            |
| Language               | The preferred natural language of the response              |
| Accept                 | `JSON-LD`, `JSON` or `GeoJSON`                              |
| @context               | NGSI-LD @context                                            |
| Buffering              | `off` or `on`                                               |
| Decode forbidden chars | `off` or `on`                                               |

## Input

### Payload  *JSON Object*

A `msg.payload` should contain a query condition to retrieves NGSI-LD entitites.
The values in the payload may overwrite properties.

| Name             | Data type | Description                                                         |
| ---------------- | --------- | ------------------------------------------------------------------- |
| representation   | string    | `normalizaed`, `concise` or `keyValues`                             |
| id               | string    | Entity types to retrieve                                            |
| type             | string    | Comma separated list of entity types to retrieve                    |
| idPattern        | string    | Regular expression that shall be matched by entity ids              |
| attrs            | string    | Comma separated list of attribute names                             |
| sysAttrs         | boolean   | `true` or `false`                                                   |
| q                | string    | Filter out entities by attribute values                             |
| csf              | string    | Context source fileter                                              |
| georel           | string    | Geo relationship of geoquery                                        |
| geometry         | string    | Geometry of geoquery                                                |
| coordinates      | string    | Coordinates of geoquery                                             |
| geoproperty      | string    | The name of the Property that contains the geospatial data          |
| geometryProperty | string    | GeoProperty Name                                                    |
| lang             | string    | The preferred natural language of the response                      |
| accept           | string    | `application/ld+json`, `application/json` or `application/geo+json` |
| forbidden        | boolean   | `true` or `false`                                                   |

```
{
  "idPattern": ".*",
  "type": "T",
  "attrs": "humidity",
  "q": "temperature>29",
  "keyValues": true
}
```

## Output

payload *JSON Array*

A `msg.payload` contains NGSI-LD entities.

[
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
]```
```

statusCode *Number*

A `msg.statusCode` contains a status code.

```
200
```
