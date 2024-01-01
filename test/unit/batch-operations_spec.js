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

require('babel-register')({
  plugins: ['babel-plugin-rewire']
});

const { assert } = require('chai');

const batchOperationsNode = require('../../src/nodes/NGSI-LD/batch-operations/batch-operations.js');
const MockRed = require('./helpers/mockred.js');

describe('batch-operations.js', () => {
  describe('create entities', () => {
    afterEach(() => {
      batchOperationsNode.__ResetDependency__('lib');
    });
    it('create entity', async () => {
      batchOperationsNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 201,
            headers: {},
            data: ['urn:ngsi-ld:TemperatureSensor:001', 'urn:ngsi-ld:TemperatureSensor:002']
          }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data
      });
      const batchOperations = batchOperationsNode.__get__('batchOperations');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        config: {
          data: [
            {
              id: 'urn:ngsi-ld:TemperatureSensor:001',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            },
            {
              id: 'urn:ngsi-ld:TemperatureSensor:002',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            }
          ],
          forbidden: false
        }
      };

      const message = {};
      await batchOperations(message, param);

      assert.deepEqual(message.payload, ['urn:ngsi-ld:TemperatureSensor:001', 'urn:ngsi-ld:TemperatureSensor:002']);
      assert.equal(message.statusCode, 201);
    });
    it('delete entities', async () => {
      batchOperationsNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 204,
            headers: {},
            data: undefined
          }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data
      });
      const batchOperations = batchOperationsNode.__get__('batchOperations');

      const param = {
        method: 'delete',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/delete',
        config: {
          data: ['urn:ngsi-ld:TemperatureSensor:001', 'urn:ngsi-ld:TemperatureSensor:002'],
          forbidden: false
        }
      };

      const message = {};
      await batchOperations(message, param);

      assert.equal(message.payload, undefined);
      assert.equal(message.statusCode, 204);
    });
    it('should be 400 Bad Request', async () => {
      batchOperationsNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 400,
            statusText: 'Bad Request',
            data: undefined
          }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data
      });
      const batchOperations = batchOperationsNode.__get__('batchOperations');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        config: {
          data: [
            {
              id: 'urn:ngsi-ld:TemperatureSensor:001',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            },
            {
              id: 'urn:ngsi-ld:TemperatureSensor:002',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            }
          ],
          forbidden: false
        }
      };

      let msg = '';
      const node = {
        msg: '',
        error: (e) => {
          msg = e;
        }
      };

      const message = {};
      await batchOperations.call(node, message, param);

      assert.equal(msg, 'Error while manipulating entities: 400 Bad Request');
      assert.equal(message.payload, undefined);
      assert.equal(message.statusCode, 400);
    });
    it('should be 400 Bad Request with details', async () => {
      batchOperationsNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 400,
            statusText: 'Bad Request',
            data: { error: 'detail' }
          }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data
      });
      const batchOperations = batchOperationsNode.__get__('batchOperations');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        config: {
          data: [
            {
              id: 'urn:ngsi-ld:TemperatureSensor:001',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            },
            {
              id: 'urn:ngsi-ld:TemperatureSensor:002',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            }
          ],
          forbidden: false
        }
      };

      let msg = [];
      const node = {
        msg: '',
        error: (e) => {
          msg.push(e);
        }
      };

      const message = {};
      await batchOperations.call(node, message, param);

      assert.deepEqual(msg, ['Error while manipulating entities: 400 Bad Request', 'Error details: {"error":"detail"}']);
      assert.deepEqual(message.payload, { error: 'detail' });
      assert.equal(message.statusCode, 400);
    });
    it('Should be unknown error', async () => {
      batchOperationsNode.__set__('lib', {
        http: async () => Promise.reject({ message: 'unknown error' }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data
      });
      const batchOperations = batchOperationsNode.__get__('batchOperations');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        config: {
          data: [
            {
              id: 'urn:ngsi-ld:TemperatureSensor:001',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            },
            {
              id: 'urn:ngsi-ld:TemperatureSensor:002',
              type: 'TemperatureSensor',
              category: { type: 'Property', value: 'sensor' },
              temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
              location: {
                type: 'GeoProperty',
                value: { type: 'Point', coordinates: [-73.975, 40.775556] }
              }
            }
          ],
          forbidden: false
        }
      };

      let msg = '';
      const node = {
        msg: '',
        error: (e) => {
          msg = e;
        }
      };

      const message = {};
      await batchOperations.call(node, message, param);

      assert.equal(msg, 'Exception while manipulating entities: unknown error');
      assert.deepEqual(message.payload, { error: 'unknown error' });
      assert.equal(message.statusCode, 500);
    });
  });
  describe('createParam', () => {
    it('create entities', () => {
      const createParam = batchOperationsNode.__get__('createParam');
      const msg = {
        payload: []
      };
      const config = {
        atContext: '',
        actionType: 'create',
        forbidden: 'true'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          data: [],
          accept: 'application/ld+json',
          forbidden: true
        }
      };
      assert.deepEqual(actual, expected);
    });
    it('create entity', () => {
      const createParam = batchOperationsNode.__get__('createParam');
      const msg = {
        payload: {}
      };
      const config = {
        atContext: '',
        actionType: 'create'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          data: [{}],
          accept: 'application/ld+json',
          forbidden: false
        }
      };
      assert.deepEqual(actual, expected);
    });
    it('getToken', () => {
      const createParam = batchOperationsNode.__get__('createParam');
      const msg = {
        payload: []
      };
      const config = {
        atContext: '',
        actionType: 'create'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => {},
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(typeof actual.getToken, 'function');
    });
    it('atContext', () => {
      const createParam = batchOperationsNode.__get__('createParam');
      const msg = {
        payload: []
      };
      const config = {
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
        actionType: 'create'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
          data: [],
          accept: 'application/ld+json',
          forbidden: false
        }
      };
      assert.deepEqual(actual, expected);
    });
    it('Payload not JSON Object', () => {
      const createParam = batchOperationsNode.__get__('createParam');
      const msg = {
        payload: ''
      };
      const config = {};
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      let errmsg = '';
      const node = {
        msg: '',
        error: (e) => {
          errmsg = e;
        }
      };

      const actual = createParam.call(node, msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.equal(errmsg, 'payload not JSON Object');
    });
  });
  describe('NGSI-LD batch operations node', () => {
    afterEach(() => {
      batchOperationsNode.__ResetDependency__('batchOperations');
    });
    it('create entity', async () => {
      const red = new MockRed();
      batchOperationsNode(red);
      red.createNode({
        atContext: '',
        actionType: 'create',
        forbidden: 'false',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null
        }
      });

      let actual;
      batchOperationsNode.__set__('batchOperations', (msg, param) => {
        actual = param;
        msg.payload = ['urn:ngsi-ld:TemperatureSensor:001', 'urn:ngsi-ld:TemperatureSensor:002'];
        msg.statusCode = 201;
      });

      await red.inputWithAwait({
        payload: [
          {
            id: 'urn:ngsi-ld:TemperatureSensor:001',
            type: 'TemperatureSensor',
            category: { type: 'Property', value: 'sensor' },
            temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
            location: {
              type: 'GeoProperty',
              value: { type: 'Point', coordinates: [-73.975, 40.775556] }
            }
          },
          {
            id: 'urn:ngsi-ld:TemperatureSensor:002',
            type: 'TemperatureSensor',
            category: { type: 'Property', value: 'sensor' },
            temperature: { type: 'Property', value: 25, unitCode: 'CEL' },
            location: {
              type: 'GeoProperty',
              value: { type: 'Point', coordinates: [-73.975, 40.775556] }
            }
          }
        ]
      });

      const expected = {
        payload: ['urn:ngsi-ld:TemperatureSensor:001', 'urn:ngsi-ld:TemperatureSensor:002'],
        statusCode: 201
      };

      assert.deepEqual(red.getOutput(), expected);
      assert.deepEqual(actual, {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entityOperations/create',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          data: [
            {
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
            },
            {
              id: 'urn:ngsi-ld:TemperatureSensor:002',
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
          ],
          forbidden: false,
          accept: 'application/ld+json'
        }
      });
    });
    it('payload not JSON Object', async () => {
      const red = new MockRed();
      batchOperationsNode(red);
      red.createNode({
        atContext: '',
        actionType: 'create',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null
        }
      });

      await red.inputWithAwait({
        payload: ''
      });

      const expected = {
        payload: { error: 'payload not JSON Object' },
        statusCode: 500
      };

      assert.deepEqual(red.getOutput(), expected);
      assert.equal(red.getMessage(), 'payload not JSON Object');
    });
  });
});
