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

describe('entity-attribute.js', () => {
  describe('entity attribute node', () => {
    it('create entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/create-entity',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          id: 'urn:ngsi-ld:TemperatureSensor:301',
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
        data: 'urn:ngsi-ld:TemperatureSensor:301'
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:301',
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
    it('update attribute', async () => {
      const actual = await http({
        method: 'post',
        url: '/update-attr',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        data: {
          value: ['sensor', 'actuator'],
          type: 'Property'
        }
      });

      assert.equal(actual.status, 204);
      assert.deepEqual(actual.data, '');
    });
    it('read entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/text; charset=utf-8' },
        data: 'urn:ngsi-ld:TemperatureSensor:301'
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:301',
        type: 'TemperatureSensor',
        category: {
          value: ['sensor', 'actuator'],
          type: 'Property'
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
    it('delete attribute', async () => {
      const actual = await http({
        method: 'post',
        url: '/delete-attr',
        headers: { 'Content-Type': 'application/text; charset=utf-8' },
        data: 'category'
      });

      assert.equal(actual.status, 204);
      assert.deepEqual(actual.data, '');
    });
    it('read entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/read-entity',
        headers: { 'Content-Type': 'application/text; charset=utf-8' },
        data: 'urn:ngsi-ld:TemperatureSensor:301'
      });

      assert.equal(actual.status, 200);
      assert.deepEqual(actual.data, {
        '@context': 'https://raw.githubusercontent.com/FIWARE/tutorials.CRUD-Operations/NGSI-LD/data-models/ngsi-context.jsonld',
        id: 'urn:ngsi-ld:TemperatureSensor:301',
        type: 'TemperatureSensor',
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
    it('delete entity', async () => {
      const actual = await http({
        method: 'post',
        url: '/delete-entity',
        headers: { 'Content-Type': 'application/text; charset=utf-8' },
        data: 'urn:ngsi-ld:TemperatureSensor:301'
      });

      assert.equal(actual.status, 204);
      assert.deepEqual(actual.data, '');
    });
  });
});
