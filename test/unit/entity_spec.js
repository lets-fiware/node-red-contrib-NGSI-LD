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
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
        },
      };

      const actual = await httpRequest(param);

      assert.deepEqual(actual, { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } });
    });
    it('create entity', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 201,
          headers: {},
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        config: {
          actionType: 'create',
          data: { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
        },
      };

      const actual = await httpRequest(param);

      assert.equal(actual, 201);
    });
    it('delete entity', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'delete',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'delete',
        },
      };

      const actual = await httpRequest(param);

      assert.equal(actual, 204);
    });
    it('should be 400 Bad Request', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = await httpRequest.call(node, param);

      assert.equal(actual, null);
      assert.equal(msg, 'Error while managing entity: 400 Bad Request');
    });
    it('should be 400 Bad Request with details', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request', data: { error: 'detail' } }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
        },
      };

      let msg = [];
      const node = { msg: '', error: (e) => { msg.push(e); } };

      const actual = await httpRequest.call(node, param);

      assert.equal(actual, null);
      assert.deepEqual(msg, [
        'Error while managing entity: 400 Bad Request',
        'Error details: {"error":"detail"}',
      ]);
    });
    it('Should be unknown error', async () => {
      entityNode.__set__('lib', {
        http: async () => Promise.reject('unknown error'),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityNode.__get__('httpRequest');

      const param = {
        method: 'post',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001',
        config: {
          actionType: 'read',
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = await httpRequest.call(node, param);

      assert.equal(actual, null);
      assert.equal(msg, 'Exception while managing entity: unknown error');
    });
  });
  describe('validateConfig', () => {
    it('result true', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      const actual = validateConfig({ actionType: 'read', entityId: 'urn:ngsi-ld:TemperatureSensor:001', entity: {} });

      assert.equal(actual, true);
    });
    it('Entity id not found (read)', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { actionType: 'read', entityId: '' });

      assert.equal(actual, false);
      assert.equal(msg, 'Entity id not found');
    });
    it('Entity id not found (delete)', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { actionType: 'delete', entityId: '' });

      assert.equal(actual, false);
      assert.equal(msg, 'Entity id not found');
    });
    it('Payload not JSON Object', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { actionType: 'read', entityId: 'urn:ngsi-ld:TemperatureSensor:001', entity: '' });

      assert.equal(actual, false);
      assert.equal(msg, 'Payload not JSON Object');
    });
    it('atContext not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { atContext: 123, actionType: 'delete', entityId: 'urn:ngsi-ld:TemperatureSensor:001' });

      assert.equal(actual, false);
      assert.equal(msg, 'atContext not string');
    });
    it('representation not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { representation: true, actionType: 'delete', entityId: 'urn:ngsi-ld:TemperatureSensor:001' });

      assert.equal(actual, false);
      assert.equal(msg, 'representation not string');
    });
    it('entityId not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { actionType: 'delete', entityId: [] });

      assert.equal(actual, false);
      assert.equal(msg, 'entityId not string');
    });
    it('attrs not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { attrs: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.equal(msg, 'attrs not string');
    });
    it('geometryProperty not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { geometryProperty: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.equal(msg, 'geometryProperty not string');
    });
    it('lang not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { lang: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.equal(msg, 'lang not string');
    });
    it('accept not string', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { accept: 123, actionType: 'create' });

      assert.equal(actual, false);
      assert.equal(msg, 'accept not string');
    });
    it('sysAttrs not boolean', () => {
      const validateConfig = entityNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { sysAttrs: 'true', actionType: 'create' });

      assert.equal(actual, false);
      assert.equal(msg, 'sysAttrs not boolean');
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

      let errmsg = '';
      const node = { msg: '', error: (e) => { errmsg = e; } };

      const actual = createParam.call(node, msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.equal(errmsg, 'Payload not stirng or JSON Object');
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

      let errmsg = '';
      const node = { msg: '', error: (e) => { errmsg = e; } };

      const actual = createParam.call(node, msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.equal(errmsg, 'ActionType error: append');
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

      let errmsg = '';
      const node = { msg: '', error: (e) => { errmsg = e; } };

      const actual = createParam.call(node, msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.equal(errmsg, 'lang not string');
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
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null,
        }
      });

      let actual;
      entityNode.__set__('httpRequest', (param) => {
        actual = param;
        return '201';
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
        payload: '201',
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
        sysAttrs: false,
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',

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

      assert.equal(red.getMessage(), 'ActionType error: append');
    });
  });
});
