/*
   MIT License
 
   Copyright 2023-2024 Kazuhito Suda
 
   This file is part of node-red-contrib-NGSI-LD
 
   https://github.com/lets-fiware/node-red-contrib-NGSI-LD
 
   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:
 
   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.
 
   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   SOFTWARE.
 */

/* eslint-env node, mocha */

'use strict';

const { assert } = require('chai');
const axios = require('axios');

async function http(options) {
  return new Promise(function (resolve, reject) {
    options.baseURL = 'http://127.0.0.1:1880';
    axios(options)
      .then(function (response) {
        resolve(response);
      })
      .catch(function (error) {
        if (axios.isAxiosError(error)) {
          if (typeof error.response !== 'undefined') {
            resolve(error.response);
          } else {
            reject(error);
          }
        } else {
          reject(error);
        }
      });
  });
}

describe('entity.js', () => {
  describe('entity node', () => {
    it('create entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/create-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          id: 'urn:ngsi-ld:TemperatureSensor:001',
          type: 'TemperatureSensor',
          category: {
            type: 'Property',
            value: 'sensor'
          },
          temperature: {
            type: 'Property',
            value: 25,
            unitCode: 'CEL'
          },
          location: {
            type: 'GeoProperty',
            value: {
              type: 'Point',
              coordinates: [-73.975, 40.775556]
            }
          }
        }
      });

      assert.equal(actual.status, 201);
      assert.equal(actual.data, '');
    });
    it('read entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/text; charset=utf-8' },
        data: 'urn:ngsi-ld:TemperatureSensor:001'
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:001',
        type: 'TemperatureSensor',
        category: {
          type: 'Property',
          value: 'sensor'
        },
        temperature: {
          type: 'Property',
          value: 25,
          unitCode: 'CEL'
        },
        location: {
          type: 'GeoProperty',
          value: {
            type: 'Point',
            coordinates: [-73.975, 40.775556]
          }
        }
      });
    });
    it('read entity with json payload', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:001'
        }
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:001',
        type: 'TemperatureSensor',
        category: {
          type: 'Property',
          value: 'sensor'
        },
        temperature: {
          type: 'Property',
          value: 25,
          unitCode: 'CEL'
        },
        location: {
          type: 'GeoProperty',
          value: {
            type: 'Point',
            coordinates: [-73.975, 40.775556]
          }
        }
      });
    });
    it('read entity as concise', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:001',
          representation: 'concise'
        }
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:001',
        type: 'TemperatureSensor',
        category: 'sensor',
        temperature: {
          value: 25,
          unitCode: 'CEL'
        },
        location: {
          type: 'Point',
          coordinates: [-73.975, 40.775556]
        }
      });
    });
    it('read entity as keyValues', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:001',
          representation: 'keyValues'
        }
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:001',
        type: 'TemperatureSensor',
        category: 'sensor',
        temperature: 25,
        location: {
          type: 'Point',
          coordinates: [-73.975, 40.775556]
        }
      });
    });
    it('read entity with sysAttrs', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:001',
          sysAttrs: true
        }
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(typeof actual.data.createdAt, 'string');
      assert.deepEqual(typeof actual.data.modifiedAt, 'string');
    });
    it('read entity as json', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:001',
          accept: 'application/json'
        }
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        id: 'urn:ngsi-ld:TemperatureSensor:001',
        type: 'TemperatureSensor',
        category: {
          type: 'Property',
          value: 'sensor'
        },
        temperature: {
          type: 'Property',
          value: 25,
          unitCode: 'CEL'
        },
        location: {
          type: 'GeoProperty',
          value: {
            type: 'Point',
            coordinates: [-73.975, 40.775556]
          }
        }
      });
    });
    it('read entity as geojson', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:001',
          accept: 'application/geo+json'
        }
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        id: 'urn:ngsi-ld:TemperatureSensor:001',
        type: 'Feature',
        properties: {
          type: 'TemperatureSensor',
          category: {
            type: 'Property',
            value: 'sensor'
          },
          temperature: {
            type: 'Property',
            value: 25,
            unitCode: 'CEL'
          },
          location: {
            type: 'GeoProperty',
            value: {
              type: 'Point',
              coordinates: [-73.975, 40.775556]
            }
          }
        },
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        geometry: {
          type: 'Point',
          coordinates: [-73.975, 40.775556]
        }
      });
    });
    it('delete entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/delete-entity',
        headers: { 'Content-Type': 'application/text; charset=utf-8' },
        data: 'urn:ngsi-ld:TemperatureSensor:001'
      });

      assert.equal(actual.status, 204);
      assert.deepEqual(actual.data, '');
    });
  });
});
