/*
   MIT License
 
   Copyright 2023 Kazuhito Suda
 
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

const entityAttributesNode = require('../../src/nodes/NGSI-LD/entity-attributes/entity-attributes.js');
const MockRed = require('./helpers/mockred.js');

describe('entity-attributes.js', () => {
  describe('updateAttrs', () => {
    afterEach(() => {
      entityAttributesNode.__ResetDependency__('lib');
    });
    it('update attributes', async () => {
      entityAttributesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
      });

      const updateAttrs = entityAttributesNode.__get__('updateAttrs');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs',
        method: 'update',
        config: {
          attributes: {
            'batteryLevel': {
              'type': 'Property',
              'value': 0.9,
              'unitCode': 'C62'
            },
            'controlledAsset': {
              'type': 'Relationship',
              'object': 'urn:ngsi-ld:Building:barn002'
            }
          },
          forbidden: false,
        },
      };

      const message = {};

      await updateAttrs(message, param);

      assert.equal(message.payload, undefined);
      assert.equal(message.statusCode, 204);
    });
    it('should be 400 Bad Request', async () => {
      entityAttributesNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
      });
      const updateAttrs = entityAttributesNode.__get__('updateAttrs');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs',
        method: 'update',
        config: {
          attributes: {
          },
          forbidden: false,
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const message = {};

      await updateAttrs.call(node, message, param);

      assert.equal(msg, 'Error while updating attributes: 400 Bad Request');
      assert.equal(message.payload, undefined);
      assert.equal(message.statusCode, 400);
    });
    it('should be 400 Bad Request with details', async () => {
      entityAttributesNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request', data: { error: 'detail' } }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
      });
      const updateAttrs = entityAttributesNode.__get__('updateAttrs');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs',
        method: 'update',
        config: {
          attributes: {
          },
          forbidden: false,
        },
      };

      let msg = [];
      const node = { msg: '', error: (e) => { msg.push(e); } };

      const message = {};

      await updateAttrs.call(node, message, param);

      assert.deepEqual(msg, [
        'Error while updating attributes: 400 Bad Request',
        'Error details: {"error":"detail"}',
      ]);
      assert.deepEqual(message.payload, { error: 'detail' });
      assert.equal(message.statusCode, 400);
    });
    it('Should be unknown error', async () => {
      entityAttributesNode.__set__('lib', {
        http: async () => Promise.reject({ message: 'unknown error' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
      });
      const updateAttrs = entityAttributesNode.__get__('updateAttrs');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs',
        method: 'update',
        config: {
          attributes: {
          },
          forbidden: false,
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const message = {};

      await updateAttrs.call(node, message, param);

      assert.equal(msg, 'Exception while updating attributes: unknown error');
      assert.deepEqual(message.payload, { error: 'unknown error' });
      assert.equal(message.statusCode, 500);
    });
  });
  describe('validateConfig', () => {
    it('result true', () => {
      const validateConfig = entityAttributesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, {
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: {},
        forbidden: false,
      });

      assert.equal(actual, true);
      assert.deepEqual(msg, {});
    });
    it('entityId not string', () => {
      const validateConfig = entityAttributesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, {
        entityId: {},
        attributes: {},
        forbidden: false,
      });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'entityId not string' } });
    });
    it('forbidden not boolean', () => {
      const validateConfig = entityAttributesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, {
        entityId: '',
        attributes: {},
        forbidden: 'true',
      });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'forbidden not boolean' } });
    });
    it('entityId is empty', () => {
      const validateConfig = entityAttributesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, {
        entityId: '',
        attributes: {},
        forbidden: false
      });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'entityId is empty' } });
    });
    it('attributes not JSON Object', () => {
      const validateConfig = entityAttributesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, {
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: '',
        forbidden: false
      });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'attributes not JSON Object' } });
    });
  });
  describe('createParam', () => {
    it('append attributes', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      };
      const config = {
        actionType: 'append',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
        forbidden: 'true',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs');
      assert.equal(actual.getToken, null);
      assert.equal(actual.method, 'post');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'append',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: {
          batteryLevel: {
            type: 'Property',
            value: 0.9,
            unitCode: 'C62',
          },
          controlledAsset: {
            type: 'Relationship',
            object: 'urn:ngsi-ld:Building:barn002',
          },
        },
        noOverwrite: true,
        forbidden: true,
      });
    });
    it('upsert attributes', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      };
      const config = {
        actionType: 'upsert',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs');
      assert.equal(actual.getToken, null);
      assert.equal(actual.method, 'post');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'upsert',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: {
          batteryLevel: {
            type: 'Property',
            value: 0.9,
            unitCode: 'C62',
          },
          controlledAsset: {
            type: 'Relationship',
            object: 'urn:ngsi-ld:Building:barn002',
          },
        },
        forbidden: false,
      });
    });
    it('update attributes', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs');
      assert.equal(actual.getToken, null);
      assert.equal(actual.method, 'patch');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: {
          batteryLevel: {
            type: 'Property',
            value: 0.9,
            unitCode: 'C62',
          },
          controlledAsset: {
            type: 'Relationship',
            object: 'urn:ngsi-ld:Building:barn002',
          },
        },
        forbidden: false,
      });
    });
    it('append attribute with entityId and attrs', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:002',
          attrs: {
            'batteryLevel': {
              'type': 'Property',
              'value': 0.9,
              'unitCode': 'C62'
            },
            'controlledAsset': {
              'type': 'Relationship',
              'object': 'urn:ngsi-ld:Building:barn002'
            }
          }
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:002/attrs');
      assert.equal(actual.getToken, null);
      assert.equal(actual.method, 'patch');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:002',
        attributes: {
          batteryLevel: {
            type: 'Property',
            value: 0.9,
            unitCode: 'C62',
          },
          controlledAsset: {
            type: 'Relationship',
            object: 'urn:ngsi-ld:Building:barn002',
          },
        },
        forbidden: false,
      });
    });
    it('getToken', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => { },
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs');
      assert.equal(typeof actual.getToken, 'function');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: {
          batteryLevel: {
            type: 'Property',
            value: 0.9,
            unitCode: 'C62',
          },
          controlledAsset: {
            type: 'Relationship',
            object: 'urn:ngsi-ld:Building:barn002',
          },
        },
        forbidden: false,
      });
    });
    it('atContext', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attributes: {
          batteryLevel: {
            type: 'Property',
            value: 0.9,
            unitCode: 'C62',
          },
          controlledAsset: {
            type: 'Relationship',
            object: 'urn:ngsi-ld:Building:barn002',
          },
        },
        forbidden: false,
      });
    });
    it('payload not JSON Object', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = { payload: [] };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => { },
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.deepEqual(msg, { payload: { error: 'payload not JSON Object' } });
    });
    it('ActionType error', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:002',
          attrs: {
            'batteryLevel': {
              'type': 'Property',
              'value': 0.9,
              'unitCode': 'C62'
            },
            'controlledAsset': {
              'type': 'Relationship',
              'object': 'urn:ngsi-ld:Building:barn002'
            }
          }
        }
      };
      const config = {
        actionType: 'create',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.deepEqual(msg, { payload: { error: 'ActionType error: create' } });
    });
    it('Error validateConfig', () => {
      const createParam = entityAttributesNode.__get__('createParam');
      const msg = {
        payload: {
          entityId: {},
          attrs: {
            'batteryLevel': {
              'type': 'Property',
              'value': 0.9,
              'unitCode': 'C62'
            },
            'controlledAsset': {
              'type': 'Relationship',
              'object': 'urn:ngsi-ld:Building:barn002'
            }
          }
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.deepEqual(msg, { payload: { error: 'entityId not string' } });
    });
  });
  describe('NGSI-LD entities node', () => {
    afterEach(() => {
      entityAttributesNode.__ResetDependency__('lib');
    });
    it('Updte attribute', async () => {
      entityAttributesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        isStringOrJson: () => { return true; },
        isJson: () => { return true; },
        encodeNGSI: (data) => data,
      });
      const red = new MockRed();
      entityAttributesNode(red);
      red.createNode({
        actionType: 'append',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null,
        }
      });

      await red.inputWithAwait({
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      });

      assert.deepEqual(red.getOutput(), { payload: undefined, statusCode: 204 });
    });
    it('ActionType error', async () => {
      const red = new MockRed();
      entityAttributesNode(red);
      red.createNode({
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        atContext: '',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null,
        }
      });

      await red.inputWithAwait({
        payload: {
          'batteryLevel': {
            'type': 'Property',
            'value': 0.9,
            'unitCode': 'C62'
          },
          'controlledAsset': {
            'type': 'Relationship',
            'object': 'urn:ngsi-ld:Building:barn002'
          }
        }
      });

      assert.deepEqual(red.getOutput(), { payload: { error: 'ActionType error: delete' }, statusCode: 500 });
      assert.equal(red.getMessage(), 'ActionType error: delete');
    });
  });
});
