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

const entityAttributeNode = require('../../src/nodes/NGSI-LD/entity-attribute/entity-attribute.js');
const MockRed = require('./helpers/mockred.js');

describe('entity-attribute.js', () => {
  describe('httpRequest', () => {
    afterEach(() => {
      entityAttributeNode.__ResetDependency__('lib');
    });
    it('update attribute', async () => {
      entityAttributeNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
          data: {
            'value': [
              'sensor',
              'actuator'
            ],
            'type': 'Property'
          },
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });

      const httpRequest = entityAttributeNode.__get__('httpRequest');

      const param = {
        method: 'patch',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category',
        config: {
          actionType: 'update',
        },
      };

      const actual = await httpRequest(param);

      assert.deepEqual(actual, 204);
    });
    it('Delete attribute', async () => {
      entityAttributeNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });

      const httpRequest = entityAttributeNode.__get__('httpRequest');

      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category',
        config: {
          actionType: 'delete',
        },
      };

      const actual = await httpRequest(param);

      assert.deepEqual(actual, 204);
    });
    it('should be 400 Bad Request', async () => {
      entityAttributeNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityAttributeNode.__get__('httpRequest');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category',
        config: {
          actionType: 'delete',
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = await httpRequest.call(node, param);

      assert.equal(actual, 400);
      assert.equal(msg, 'Error while managing attribute: 400 Bad Request');
    });
    it('should be 400 Bad Request with details', async () => {
      entityAttributeNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request', data: { error: 'detail' } }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityAttributeNode.__get__('httpRequest');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category',
        config: {
          actionType: 'delete',
        },
      };

      let msg = [];
      const node = { msg: '', error: (e) => { msg.push(e); } };

      const actual = await httpRequest.call(node, param);

      assert.equal(actual, 400);
      assert.deepEqual(msg, [
        'Error while managing attribute: 400 Bad Request',
        'Error details: {"error":"detail"}',
      ]);
    });
    it('Should be unknown error', async () => {
      entityAttributeNode.__set__('lib', {
        http: async () => Promise.reject('unknown error'),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const httpRequest = entityAttributeNode.__get__('httpRequest');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category',
        config: {
          actionType: 'delete',
        },
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = await httpRequest.call(node, param);

      assert.equal(actual, null);
      assert.equal(msg, 'Exception while managing attribute: unknown error');
    });
  });
  describe('validateConfig', () => {
    it('result true', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      const actual = validateConfig({});

      assert.equal(actual, true);
    });
    it('atContext not string', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { atContext: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'atContext not string');
    });
    it('entityId not string', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { entityId: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'entityId not string');
    });
    it('attrName not string', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { attrName: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'attrName not string');
    });
    it('datasetid not string', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { datasetid: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'datasetid not string');
    });
    it('entityId not found', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { entityId: '' });

      assert.equal(actual, false);
      assert.equal(msg, 'entityId not found');
    });
    it('attrName not found', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { attrName: '' });

      assert.equal(actual, false);
      assert.equal(msg, 'attrName not found');
    });
    it('deleteAll not boolean', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { deleteAll: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'deleteAll not boolean');
    });
    it('attribute not JSON Object', () => {
      const validateConfig = entityAttributeNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { actionType: 'update', attribute: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'attribute not JSON Object');
    });
  });
  describe('createParam', () => {
    it('update attribute', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = {
        payload: {
          value: [
            'sensor',
            'actuator'
          ],
          type: 'Property'
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        attribute: {
          value: [
            'sensor',
            'actuator',
          ],
          type: 'Property',
        },
      });
    });
    it('update attribute with entityId and attrName', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = {
        payload: {
          entityId: 'urn:ngsi-ld:TemperatureSensor:002',
          attrName: 'speed',
          attribute: {
            value: [
              'sensor',
              'actuator'
            ],
            type: 'Property'
          }
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:002/attrs/speed');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:002',
        attrName: 'speed',
        attribute: {
          value: [
            'sensor',
            'actuator',
          ],
          type: 'Property',
        },
      });
    });
    it('Delete attribute', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = { payload: {} };
      const config = {
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        attribute: null,
        datasetId: '',
        deleteAll: false,
      });
    });
    it('Delete attribute with attrName', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = { payload: 'speed' };
      const config = {
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/speed');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'speed',
        attribute: null,
        datasetId: '',
        deleteAll: false,
      });
    });
    it('getToken', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = {
        payload: {
          value: [
            'sensor',
            'actuator'
          ],
          type: 'Property'
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category');
      assert.equal(typeof actual.getToken, 'function');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        attribute: {
          value: [
            'sensor',
            'actuator',
          ],
          type: 'Property',
        },
      });
    });
    it('atContext', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = {
        payload: {
          value: [
            'sensor',
            'actuator'
          ],
          type: 'Property'
        }
      };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/urn:ngsi-ld:TemperatureSensor:001/attrs/category');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        attribute: {
          value: [
            'sensor',
            'actuator',
          ],
          type: 'Property',
        },
      });
    });
    it('Payload is not stirng or JSON Object', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = { payload: [] };
      const config = {
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => { },
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
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = {
        payload: {}
      };
      const config = {
        actionType: 'create',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
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
      assert.equal(errmsg, 'ActionType error: create');
    });
    it('Error validateConfig', () => {
      const createParam = entityAttributeNode.__get__('createParam');
      const msg = {
        payload: {
          deleteAll: 'false',
        }
      };
      const config = {
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.5.jsonld',
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
      assert.equal(errmsg, 'deleteAll not boolean');
    });
  });
  describe('NGSI-LD entities node', () => {
    afterEach(() => {
      entityAttributeNode.__ResetDependency__('lib');
    });
    it('Updte attribute', async () => {
      entityAttributeNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 204,
          headers: {},
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        isStringOrJson: () => { return true; },
        isJson: () => { return true; },
      });
      const red = new MockRed();
      entityAttributeNode(red);
      red.createNode({
        actionType: 'update',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
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
          entityId: 'urn:ngsi-ld:TemperatureSensor:002',
          attrName: 'speed',
          attribute: {
            value: [
              'sensor',
              'actuator'
            ],
            type: 'Property'
          }
        }
      });

      assert.deepEqual(red.getOutput(), { payload: 204 });
    });
    it('Error createParam', async () => {
      const red = new MockRed();
      entityAttributeNode(red);
      red.createNode({
        actionType: 'delete',
        entityId: 'urn:ngsi-ld:TemperatureSensor:001',
        attrName: 'category',
        deleteAll: 'false',
        datasetId: '',
        atContext: '',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null,
        }
      });

      await red.inputWithAwait({ payload: { deleteAll: 'false' } });

      assert.equal(red.getMessage(), 'deleteAll not boolean');
    });
  });
});
