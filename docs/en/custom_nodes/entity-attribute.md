# NGSI-LD entity attribute

This custom node is a simple node that allows to update or delete an attribute in NGSI-LD entity.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity-attribute/entity-attribute-01.png)

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Update an attribute](#update-an-attribute)
-   [Delete an attribute](#delete-an-attribute)

</details>

## Update an attribute

It allows to update an attribute in NGSI-LD entity.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity-attribute/entity-attribute-02.png)

| Property       | Description                               |
| -------------- | ----------------------------------------- |
| Name           | A name for a node instance                |
| Broker         | An endpoint of a NGSI-LD broker           |
| Action type    | `update`                                  |
| Entity id      | Id of the concerned entity                |
| Attribute name | Attribute name (Property or Relationship) | 
| @context       | NGSI-LD @context                          |

### Example

#### Input 1

payload *JSON Object*

A `msg.payload` should contain an object representing the attribute to update.

```
{
  "value": [
    "sensor",
    "actuator"
  ],
  "type": "Property"
}
```

#### Input 2

payload *JSON Object*

A `msg.payload` should contain information related to the attribute to update.
The values in the payload may overwrite properties.

| Name      | Data type   | Description                                    |
| --------- | ----------- | ---------------------------------------------- |
| entityId  | string      | Id of the concerned entity                     |
| attrName  | string      | Attribute name (Property or Relationship)      |
| attribute | JSON Object | An object representing the attribute to update |

```
{
  "entityId": "urn:ngsi-ld:TemperatureSensor:002",
  "attrName": "speed",
  "attribute": {
    "value": [
      "sensor",
      "actuator"
    ],
    "type": "Property"
  }
}
```

#### Output

statusCode *Number*

A `msg.statusCode` contains a status code.

```
204
```

## Delete an attribute

It allows to delete an attribute in NGSI-LD entity.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/entity-attribute/entity-attribute-03.png)

| Property       | Description                               |
| -------------- | ----------------------------------------- |
| Name           | A name for a node instance                |
| Broker         | An endpoint of a NGSI-LD broker           |
| Action type    | `delete`                                  |
| Entity id      | Id of the concerned entity                |
| Attribute name | Attribute name (Property or Relationship) | 
| Delete all     | `true` or `false`                         |
| Dataset id     | datasetId of the dataset to be deleted    |
| @context       | NGSI-LD @context                          |

### Example

#### Input1

payload *JSON Object*

A `msg.payload` should contain an empty JSON Object.  The attribute name specified by the property will be deleted.

```
{}
```

#### Input2

payload *JSON Object*

A `msg.payload` should contain information related to the attribute to delete.
The values in the payload may overwrite properties.

| Name       | Data type | Description                               |
| ---------- | --------- | ----------------------------------------- |
| entityId   | string    | Id of the concerned entity                |
| attrName   | string    | Attribute name (Property or Relationship) |
| deleteAll  | boolean   | `true` or `false`                         |
| datasetid  | string    | datasetId of the dataset to be deleted    |

```
{
  "attrName": "speed",
  "deleteAll: true
}
```

#### Output

statusCode *Number*

A `msg.statusCode` contains a status code.

```
204
```