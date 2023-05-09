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

const entityNode = require('../../src/nodes/NGSI-LD/entity/entity.js');
const MockRed = require('./helpers/mockred.js');

describe('entity.js', () => {
  describe('httpRequest', () => {
    afterEach(() => {
      entityNode.__ResetDependency__('lib');
    });
    it('get entity', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          headers: {},
          data: { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
        decodeNGSI: (data) => data,
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
          forbidden: false,
        },
      };

      const message = {};
      await httpRequest(message, param);

      assert.deepEqual(message, { payload: { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }, statusCode: 200 });
    });
    it('create entity', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 201,
          headers: {},
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
        decodeNGSI: (data) => data,
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        config: {
          actionType: 'create',
          data: { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
          forbidden: false,
        },
      };

      const message = {};
      await httpRequest(message, param);

      assert.equal(message.payload, null);
      assert.equal(message.statusCode, 201);
    });
    it('delete entity', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
        decodeNGSI: (data) => data,
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'delete',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'delete',
          forbidden: false,
        },
      };

      const message = {};
      await httpRequest(message, param);

      assert.equal(message.payload, null);
      assert.equal(message.statusCode, 204);
    });
    it('should be 400 Bad Request', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
        decodeNGSI: (data) => data,
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
          forbidden: false,
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const message = {};
      await httpRequest.call(node, message, param);

      assert.equal(msg, 'Error while managing entity: 400 Bad Request');
      assert.equal(message.payload, undefined);
      assert.equal(message.statusCode, 400);
    });
    it('should be 400 Bad Request with details', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request', data: { error: 'detail' } }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
        decodeNGSI: (data) => data,
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
          forbidden: false,
        },
      };

      let msg = [];
      const node = { msg: '', error: (e) => { msg.push(e); } };

      const message = {};
      await httpRequest.call(node, message, param);

      assert.deepEqual(msg, [
        'Error while managing entity: 400 Bad Request',
        'Error details: {"error":"detail"}',
      ]);
      assert.deepEqual(message.payload, { error: 'detail' });
      assert.equal(message.statusCode, 400);
    });
    it('Should be unknown error', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.reject({ message: 'unknown error' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        encodeNGSI: (data) => data,
        decodeNGSI: (data) => data,
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
          forbidden: false,
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const message = {};
      await httpRequest.call(node, message, param);

      assert.equal(msg, 'Exception while managing entity: unknown error');
      assert.deepEqual(message.payload, { error: 'unknown error' });
      assert.equal(message.statusCode, 500);
    });
  });
  describe('validateConfig', () => {
    it('result true', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { actionType: 'read', entityId: 'urn:ngsi-ld:TemperatureSensor:001', entity: {} });

      assert.equal(actual, true);
      assert.deepEqual(msg, {});
    });
    it('Entity id not found (read)', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { actionType: 'read', entityId: '' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'Entity id not found' } });
    });
    it('Entity id not found (delete)', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { actionType: 'delete', entityId: '' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'Entity id not found' } });
    });
    it('Payload not JSON Object', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { actionType: 'read', entityId: 'urn:ngsi-ld:TemperatureSensor:001', entity: '' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'Payload not JSON Object' } });
    });
    it('atContext not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { atContext: 123, actionType: 'delete', entityId: 'urn:ngsi-ld:TemperatureSensor:001' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'atContext not string' } });
    });
    it('representation not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { representation: true, actionType: 'delete', entityId: 'urn:ngsi-ld:TemperatureSensor:001' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'representation not string' } });
    });
    it('entityId not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { actionType: 'delete', entityId: [] });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'entityId not string' } });
    });
    it('attrs not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { attrs: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'attrs not string' } });
    });
    it('geometryProperty not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { geometryProperty: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'geometryProperty not string' } });
    });
    it('lang not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { lang: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'lang not string' } });
    });
    it('accept not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { accept: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'accept not string' } });
    });
    it('sysAttrs not boolean', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { sysAttrs: 'true', actionType: 'create' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'sysAttrs not boolean' } });
    });
    it('forbidden not boolean', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { forbidden: 'true', actionType: 'create' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'forbidden not boolean' } });
    });
  });
  describe('createParam', () => {
    it('create', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = { payload: 'urn:ngsi-ld:TemperatureSensor:001' };
      const config = {
        atContext: '',
        actionType: 'read',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
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

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          actionType: 'read',
          attrs: '',
          representation: 'normalized',
          sysAttrs: false,
          geometryProperty: '',
          lang: '',
          accept: 'application/ld+json',
          forbidden: true,
        },
        method: 'get',
      };
      assert.deepEqual(actual, expected);
    });
    it('read', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = {
        payload: {
          'id': 'urn:ngsi-ld:TemperatureSensor:001',
          'type': 'TemperatureSensor',
          'category': {
            'type': 'Property',
            'value': 'sensor'
          },
          'temperature': {
            'type': 'Property',
            'value': 25,
            'unitCode': 'CEL'
          },
          'location': {
            'type': 'GeoProperty',
            'value': {
              'type': 'Point',
              'coordinates': [
                -73.975,
                40.775556
              ]
            }
          }
        }
      };
      const config = {
        atContext: '',
        actionType: 'create',
        entityId: '',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          actionType: 'create',
          entity: {
            id: 'urn:ngsi-ld:TemperatureSensor:001',
            type: 'TemperatureSensor',
            category: {
              type: 'Property',
              value: 'sensor',
            },
            temperature: {
              type: 'Property',
              value: 25,
              unitCode: 'CEL',
            },
            location: {
              type: 'GeoProperty',
              value: {
                type: 'Point',
                coordinates: [
                  -73.975,
                  40.775556,
                ],
              },
            },
          },
          forbidden: false,
        },
        method: 'post',
      };
      assert.deepEqual(actual, expected);
    });
    it('delete', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = { payload: 'urn:ngsi-ld:TemperatureSensor:001' };
      const config = {
        atContext: '',
        actionType: 'delete',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          actionType: 'delete',
        },
        method: 'delete',
      };
      assert.deepEqual(actual, expected);
    });
    it('getToken', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = { payload: 'urn:ngsi-ld:TemperatureSensor:001' };
      const config = {
        atContext: '',
        actionType: 'delete',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => { },
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      assert.equal(typeof actual.getToken, 'function');
    });
    it('atContext', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = { payload: 'urn:ngsi-ld:TemperatureSensor:001' };
      const config = {
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
        actionType: 'delete',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
      };

      const actual = createParam(msg, config, brokerConfig);

      const expected = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
          actionType: 'delete',
        },
        method: 'delete',
      };
      assert.deepEqual(actual, expected);
    });
    it('Payload not stirng or JSON Object', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = {
        payload: [],
      };
      const config = {
        atContext: '',
        actionType: 'read',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
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
      assert.deepEqual(msg, { payload: { error: 'Payload not stirng or JSON Object' } });
    });
    it('ActionType error', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = { payload: 'urn:ngsi-ld:TemperatureSensor:001' };
      const config = {
        atContext: '',
        actionType: 'append',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
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
      assert.deepEqual(msg, { payload: { error: 'ActionType error: append' } });
    });
    it('Error validateConfig', () => {
      const createParam = entityNode.__get__('createParam');
      const msg = {
        payload: { entityId: 'urn:ngsi-ld:TemperatureSensor:001', lang: 123 }
      };
      const config = {
        atContext: '',
        actionType: 'read',
        entityId: 'E',
        attrs: '',
        representation: 'normalized',
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
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
      assert.deepEqual(msg, { payload: { error: 'lang not string' } });
    });
  });
  describe('NGSI-LD entity node', () => {
    afterEach(() => {
      entityNode.__ResetDependency__('httpRequest');
    });
    it('create entity', async () => {
      const red = new MockRed();
      entityNode(red);
      red.createNode({
        atContext: '',
        actionType: 'create',
        entityId: '',
        attrs: '',
        representation: 'normalized',
        sysAttrs: 'false',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        forbidden: 'false',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null,
        }
      });

      let actual;
      entityNode.__set__('httpRequest', (msg, param) => {
        actual = param;
        msg.payload = undefined;
        msg.statusCode = 201;
      });

      await red.inputWithAwait({
        payload: {
          'id': 'urn:ngsi-ld:TemperatureSensor:001',
          'type': 'TemperatureSensor',
          'category': {
            'type': 'Property',
            'value': 'sensor'
          },
          'temperature': {
            'type': 'Property',
            'value': 25,
            'unitCode': 'CEL'
          },
          'location': {
            'type': 'GeoProperty',
            'value': {
              'type': 'Point',
              'coordinates': [
                -73.975,
                40.775556
              ]
            }
          }
        }
      });

      const expected = {
        payload: undefined,
        statusCode: 201
      };

      assert.deepEqual(red.getOutput(), expected);
      assert.deepEqual(actual, {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        getToken: null,
        config: {
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          actionType: 'create',
          entity: {
            id: 'urn:ngsi-ld:TemperatureSensor:001',
            type: 'TemperatureSensor',
            category: {
              type: 'Property',
              value: 'sensor',
            },
            temperature: {
              type: 'Property',
              value: 25,
              unitCode: 'CEL',
            },
            location: {
              type: 'GeoProperty',
              value: {
                type: 'Point',
                coordinates: [
                  -73.975,
                  40.775556,
                ],
              },
            },
          },
          forbidden: false,
        },
        method: 'post',
      });
    });
    it('ActionType error: append', async () => {
      const red = new MockRed();
      entityNode(red);
      red.createNode({
        atContext: '',
        actionType: 'append',
        entityId: '',
        attrs: '',
        representation: 'normalized',
        sysAttrs: 'false',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        forbidden: 'false',

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
          'id': 'urn:ngsi-ld:TemperatureSensor:001',
          'type': 'TemperatureSensor',
          'category': {
            'type': 'Property',
            'value': 'sensor'
          },
          'temperature': {
            'type': 'Property',
            'value': 25,
            'unitCode': 'CEL'
          },
          'location': {
            'type': 'GeoProperty',
            'value': {
              'type': 'Point',
              'coordinates': [
                -73.975,
                40.775556
              ]
            }
          }
        }
      });

      assert.deepEqual(red.getOutput(), {
        payload: { error: 'ActionType error: append' },
        statusCode: 500
      });
      assert.equal(red.getMessage(), 'ActionType error: append');

    });
  });
});
