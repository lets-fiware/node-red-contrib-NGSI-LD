# NGSI-LD Batch operations

This custom node is a simple node that allows to create, upsert, update or delete NGSI-LD entities in a single batch operation.
NGSI-LD Entity data shall be provided as part of the `msg.payload`.

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/batch-operations/batch-operations-01.png)

## Contents

<details>
<summary><strong>Details</strong></summary>

-   [Create entities](#create-entities)
-   [Update entities](#update-entities)
-   [Upsert entities](#upsert-entities)
-   [Delete entities](#delete-entities)

</details>

## Create entities

It allows to create NGSI-LD entities.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/batch-operations/batch-operations-02.png)

| Property    | Description                   |
| ----------- | ----------------------------- |
| Name        | A name for a node instance    |
| Broker      | An endpoint of NGSI-LD broker |
| Action type | `create`                      |
| @context    | NGSI-LD @context              |

### Input

Payload *JSON Array*

A `msg.payload` should contain NGSI-LD entities as JSON Array.

```
[
    {
        "id": "urn:ngsi-ld:TemperatureSensor:002",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 20,
            "unitCode": "CEL"
        }
    },
    {
        "id": "urn:ngsi-ld:TemperatureSensor:003",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 2,
            "unitCode": "CEL"
        }
    },
    {
        "id": "urn:ngsi-ld:TemperatureSensor:004",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 100,
            "unitCode": "CEL"
        }
    }
]
```

### Output

Payload *Number* or *null*

A `msg.payload` contains a status code.

```
204
```

```
null
```

## Update entities

It allows to update NGSI-LD entities.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/batch-operations/batch-operations-03.png)

| Property    | Description                   |
| ----------- | ----------------------------- |
| Name        | A name for a node instance    |
| Broker      | An endpoint of NGSI-LD broker |
| Action type | `update`                      |
| @context    | NGSI-LD @context              |

### Input

Payload *JSON Array*

A `msg.payload` should contain NGSI-LD entities as JSON Array.

```
[
    {
        "id": "urn:ngsi-ld:TemperatureSensor:002",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 21,
            "unitCode": "CEL"
        }
    },
    {
        "id": "urn:ngsi-ld:TemperatureSensor:003",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 27,
            "unitCode": "CEL"
        }
    }
]
```

### Output

Payload *Number* or *null*

A `msg.payload` contains a status code.

```
204
```

```
null
```

## Upsert entities

It allows to upsert NGSI-LD entities.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/batch-operations/batch-operations-04.png)

| Property    | Description                   |
| ----------- | ----------------------------- |
| Name        | A name for a node instance    |
| Broker      | An endpoint of NGSI-LD broker |
| Action type | `upsert`                      |
| @context    | NGSI-LD @context              |

### Input

Payload *JSON Array*

A `msg.payload` should contain NGSI-LD entities as JSON Array.

```
[
    {
        "id": "urn:ngsi-ld:TemperatureSensor:002",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 21,
            "unitCode": "CEL"
        }
    },
    {
        "id": "urn:ngsi-ld:TemperatureSensor:003",
        "type": "TemperatureSensor",
        "category": {
            "type": "Property",
            "value": "sensor"
        },
        "temperature": {
            "type": "Property",
            "value": 27,
            "unitCode": "CEL"
        }
    }
]
```

### Output

Payload *Number* or *null*

A `msg.payload` contains a status code.

```
204
```

```
null
```

## Delete entities

It allows to delete NGSI-LD entities.

### Properties

![](https://raw.githubusercontent.com/lets-fiware/node-red-contrib-NGSI-LD/gh-pages/images/batch-operations/batch-operations-05.png)

| Property    | Description                   |
| ----------- | ----------------------------- |
| Name        | A name for a node instance    |
| Broker      | An endpoint of NGSI-LD broker |
| Action type | `delete`                      |
| @context    | NGSI-LD @context              |

### Input

Payload *JSON Araay*

A `msg.payload` should contain NGSI-LD entities as JSON Array.

```
[
    "urn:ngsi-ld:TemperatureSensor:002",
    "urn:ngsi-ld:TemperatureSensor:003",
    "urn:ngsi-ld:TemperatureSensor:004"
]
```

### Output

Payload *Number* or *null*

A `msg.payload` contains a status code.

```
204
```

```
null
```
