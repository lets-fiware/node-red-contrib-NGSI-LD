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

const entitiesNode = require('../../src/nodes/NGSI-LD/entities/entities.js');
const MockRed = require('./helpers/mockred.js');

const buffering = {
  node: null,
  msg: null,
  entities: [],
  open: function (node, msg) {
    this.node = node;
    this.msg = msg;
    this.entities = [];
    return this;
  },
  send: function (entities) {
    this.entities = this.entities.concat(entities);
  },
  close: function () {
    this.msg.payload = this.entities;
    this.msg.statusCode = 200;
    this.node.send(this.msg);
  },
  out: function (entities) {
    this.entities = this.entities.concat(entities);
  }
};

const nobuffering = {
  node: null,
  msg: null,
  open: function (node, msg) {
    this.node = node;
    this.msg = msg;
    return this;
  },
  send: function (entities) {
    const message = Object.assign({}, this.msg);
    message.payload = entities;
    message.statusCode = 200;
    this.node.send(message);
  },
  close: function () {},
  out: function (entities) {
    const message = Object.assign({}, this.msg);
    message.payload = entities;
    message.statusCode = 200;
    this.node.send(message);
  }
};

describe('entities.js', () => {
  describe('getEntities', () => {
    afterEach(() => {
      entitiesNode.__ResetDependency__('lib');
    });
    it('get entities', async () => {
      entitiesNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 200,
            headers: { 'NGSILD-Results-Count': 2 },
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
            ]
          }),
        buildHTTPHeader: async () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        decodeNGSI: (data) => data
      });

      const getEntities = entitiesNode.__get__('getEntities');

      let actual;
      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({
          send: (entities) => {
            actual = entities;
          }
        }),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      const message = {};
      await getEntities(message, param);

      assert.deepEqual(actual, {
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
        ],
        statusCode: 200
      });
    });
    it('get 4 entities', async () => {
      entitiesNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 200,
            headers: { 'NGSILD-Results-Count': 4 },
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
            ]
          }),
        buildHTTPHeader: async () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        decodeNGSI: (data) => data
      });

      const getEntities = entitiesNode.__get__('getEntities');

      let actual = [];
      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: buffering.open(
          {
            send: (entities) => {
              actual = actual.concat(entities);
            }
          },
          { payload: null }
        ),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      const message = {};
      await getEntities(message, param);

      assert.deepEqual(actual, [
        {
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
            },
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
          statusCode: 200
        }
      ]);
    });
    it('empty', async () => {
      entitiesNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 200,
            headers: { 'NGSILD-Results-Count': 0 },
            data: []
          }),
        buildHTTPHeader: async () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        decodeNGSI: (data) => data
      });

      const getEntities = entitiesNode.__get__('getEntities');

      let actual;
      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({
          send: (entities) => {
            actual = entities;
          }
        }),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      const message = {};
      await getEntities(message, param);

      assert.deepEqual(actual, { payload: [], statusCode: 200 });
    });
    it('NGSILD-Results-Count is 0', async () => {
      entitiesNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 200,
            headers: { 'NGSILD-Results-Count': 0 },
            data: [{}]
          }),
        buildHTTPHeader: async () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        decodeNGSI: (data) => data
      });

      const getEntities = entitiesNode.__get__('getEntities');

      let actual;
      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({
          send: (entities) => {
            actual = entities;
          }
        }),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      const message = {};
      await getEntities(message, param);

      assert.deepEqual(actual, { payload: [{}], statusCode: 200 });
    });
    it('should be 400 Bad Request', async () => {
      entitiesNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 400,
            statusText: 'Bad Request',
            data: null
          }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams()
      });
      const getEntities = entitiesNode.__get__('getEntities');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: () => {} }),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      let errmsg = '';
      let out = {};
      const node = {
        errmsg: '',
        error: (e) => {
          errmsg = e;
        },
        send: (o) => {
          out = o;
        }
      };

      const message = {};
      await getEntities.call(node, message, param);

      assert.equal(errmsg, 'Error while retrieving entities: 400 Bad Request');
      assert.deepEqual(out, { payload: null, statusCode: 400 });
    });
    it('should be 400 Bad Request with details', async () => {
      entitiesNode.__set__('lib', {
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
        decodeNGSI: (data) => data
      });
      const getEntities = entitiesNode.__get__('getEntities');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: () => {} }),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      let errmsg = [];
      let out = undefined;
      const node = {
        errmsg: '',
        error: (e) => {
          errmsg.push(e);
        },
        send: (o) => {
          out = o;
        }
      };

      const message = {};
      await getEntities.call(node, message, param);

      assert.deepEqual(errmsg, ['Error while retrieving entities: 400 Bad Request', 'Error details: {"error":"detail"}']);
      assert.deepEqual(out, { payload: { error: 'detail' }, statusCode: 400 });
    });
    it('Should be unknown error', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.reject({ message: 'unknown error' }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        decodeNGSI: (data) => data
      });
      const getEntities = entitiesNode.__get__('getEntities');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: () => {} }),
        config: {
          offset: 0,
          limit: 2,
          forbidden: false
        }
      };

      let errmsg = '';
      let out = {};
      const node = {
        errmsg: '',
        error: (e) => {
          errmsg = e;
        },
        send: (o) => {
          out = o;
        }
      };

      const message = {};
      await getEntities.call(node, message, param);

      assert.equal(errmsg, 'Exception while retrieving entities: unknown error');
      assert.deepEqual(out.payload, { error: 'unknown error' });
      assert.equal(out.statusCode, 500);
    });
  });
  describe('nobuffering', () => {
    let nobuffering;

    before(() => {
      // Create a param
      const createParam = entitiesNode.__get__('createParam');
      const msg = { payload: { idPattern: '.*' } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => {},
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const node = { msg: '' };
      const param = createParam.call(node, msg, config, brokerConfig);

      nobuffering = param.buffer;
    });

    it('should have a entity', () => {
      const errmsg = {};
      const actual = [];

      nobuffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      nobuffering.send([{ id: 'E1', type: 'T' }]);
      nobuffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }], statusCode: 200 }]);
    });
    it('should have entities', () => {
      const errmsg = {};
      const actual = [];

      nobuffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      nobuffering.send([{ id: 'E1', type: 'T' }]);
      nobuffering.send([{ id: 'E2', type: 'T' }]);
      nobuffering.close();

      assert.deepEqual(actual, [
        { payload: [{ id: 'E1', type: 'T' }], statusCode: 200 },
        { payload: [{ id: 'E2', type: 'T' }], statusCode: 200 }
      ]);
    });
    it('should be empty', () => {
      const errmsg = {};
      const actual = [];

      nobuffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      nobuffering.close();

      assert.deepEqual(actual, []);
    });
    it('should have a entity', () => {
      const errmsg = {};
      const actual = [];

      nobuffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      nobuffering.out([{ id: 'E1', type: 'T' }]);
      nobuffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }], statusCode: 200 }]);
    });
  });

  describe('buffering', () => {
    let buffering;

    before(() => {
      // Create a param
      const createParam = entitiesNode.__get__('createParam');
      const msg = { payload: { idPattern: '.*' } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'on'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => {},
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const node = { msg: '' };
      const param = createParam.call(node, msg, config, brokerConfig);

      buffering = param.buffer;
    });

    it('should have a entity', () => {
      const errmsg = {};
      const actual = [];

      buffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      buffering.send([{ id: 'E1', type: 'T' }]);
      buffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }], statusCode: 200 }]);
    });
    it('should have a entities', () => {
      const errmsg = {};
      const actual = [];

      buffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      buffering.send([{ id: 'E1', type: 'T' }]);
      buffering.send([{ id: 'E2', type: 'T' }]);
      buffering.close();

      assert.deepEqual(actual, [
        {
          payload: [
            { id: 'E1', type: 'T' },
            { id: 'E2', type: 'T' }
          ],
          statusCode: 200
        }
      ]);
    });
    it('should be empty', () => {
      const errmsg = {};
      const actual = [];

      buffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      buffering.close();

      assert.deepEqual(actual, [{ payload: [], statusCode: 200 }]);
    });
    it('should have a entity', () => {
      const errmsg = {};
      const actual = [];

      buffering.open(
        {
          send: (data) => {
            actual.push(data);
          }
        },
        errmsg
      );
      buffering.out([{ id: 'E1', type: 'T' }]);
      buffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }], statusCode: 200 }]);
    });
  });
  describe('validateConfig', () => {
    it('result true', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, {});

      assert.equal(actual, true);
      assert.deepEqual(msg, {});
    });
    it('atContext not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { atContext: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'atContext not string' } });
    });
    it('representation not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { representation: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, {
        payload: { error: 'representation not string' }
      });
    });
    it('id not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { id: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'id not string' } });
    });
    it('type not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { type: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'type not string' } });
    });
    it('idPattern not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { idPattern: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'idPattern not string' } });
    });
    it('attrs not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { attrs: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'attrs not string' } });
    });
    it('q not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { q: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'q not string' } });
    });
    it('csf not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { csf: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'csf not string' } });
    });
    it('georel not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { georel: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'georel not string' } });
    });
    it('geometry not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { geometry: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'geometry not string' } });
    });
    it('coordinates not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { coordinates: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'coordinates not string' } });
    });
    it('geoproperty not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { geoproperty: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'geoproperty not string' } });
    });
    it('geometryProperty not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { geometryProperty: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, {
        payload: { error: 'geometryProperty not string' }
      });
    });
    it('lang not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { lang: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'lang not string' } });
    });
    it('accept not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { accept: 123 });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'accept not string' } });
    });
    it('buffering not boolean', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { buffering: 'true' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'buffering not boolean' } });
    });
    it('sysAttrs not boolean', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { sysAttrs: 'true' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'sysAttrs not boolean' } });
    });
    it('forbidden not boolean', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { forbidden: 'true' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'forbidden not boolean' } });
    });
    it('limit not number', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { limit: '123' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'limit not number' } });
    });
    it('offset not number', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const msg = {};
      const actual = validateConfig(msg, { offset: '123' });

      assert.equal(actual, false);
      assert.deepEqual(msg, { payload: { error: 'offset not number' } });
    });
  });
  describe('createParam', () => {
    it('string param', () => {
      const createParam = entitiesNode.__get__('createParam');
      const errmsg = { payload: '.*' };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(errmsg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        representation: 'normalized',
        id: '',
        type: '',
        idPattern: '.*',
        attrs: '',
        sysAttrs: false,
        q: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        buffering: false,
        forbidden: false,
        limit: 100,
        offset: 0
      });
    });
    it('object param', () => {
      const createParam = entitiesNode.__get__('createParam');
      const errmsg = { payload: { idPattern: '.*' } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off',
        forbidden: 'true'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(errmsg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        representation: 'normalized',
        id: '',
        type: '',
        idPattern: '.*',
        attrs: '',
        sysAttrs: false,
        q: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        buffering: false,
        forbidden: true,
        limit: 100,
        offset: 0
      });
    });
    it('getToken', () => {
      const createParam = entitiesNode.__get__('createParam');
      const errmsg = { payload: { idPattern: '.*' } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => {},
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(errmsg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/');
      assert.equal(typeof actual.getToken, 'function');
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        representation: 'normalized',
        id: '',
        type: '',
        idPattern: '.*',
        attrs: '',
        sysAttrs: false,
        q: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        buffering: false,
        forbidden: false,
        limit: 100,
        offset: 0
      });
    });
    it('atContext', () => {
      const createParam = entitiesNode.__get__('createParam');
      const errmsg = { payload: { idPattern: '.*' } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.4.jsonld',
        buffering: 'off'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(errmsg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.4.jsonld',
        representation: 'normalized',
        id: '',
        type: '',
        idPattern: '.*',
        attrs: '',
        sysAttrs: false,
        q: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        buffering: false,
        forbidden: false,
        limit: 100,
        offset: 0
      });
    });
    it('buffering', () => {
      const createParam = entitiesNode.__get__('createParam');
      const errmsg = { payload: { idPattern: '.*' } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        buffering: 'on'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: null,
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const actual = createParam(errmsg, config, brokerConfig);

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/v1/entities/');
      assert.equal(actual.getToken, null);
      assert.deepEqual(actual.config, {
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        representation: 'normalized',
        id: '',
        type: '',
        idPattern: '.*',
        attrs: '',
        sysAttrs: false,
        q: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        buffering: true,
        forbidden: false,
        limit: 100,
        offset: 0
      });
    });
    it('Payload is not stirng or JSON Object', () => {
      const createParam = entitiesNode.__get__('createParam');
      const msg = { payload: [] };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => {},
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const node = { msg: '' };
      const actual = createParam.call(node, msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.deepEqual(msg, {
        payload: { error: 'Payload not stirng or JSON Object' }
      });
    });
    it('Error validateConfig', () => {
      const createParam = entitiesNode.__get__('createParam');
      const msg = { payload: { idPattern: '.*', lang: true } };
      const config = {
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off'
      };
      const brokerConfig = {
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: '',
        getToken: () => {},
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
      };

      const node = { msg: '' };
      const actual = createParam.call(node, msg, config, brokerConfig);

      const expected = null;
      assert.equal(actual, expected);
      assert.deepEqual(msg, { payload: { error: 'lang not string' } });
    });

    describe('buffering', () => {
      it('should create a buffering object', () => {
        const createParam = entitiesNode.__get__('createParam');
        const msg = { payload: { idPattern: '.*' } };
        const config = {
          representation: 'normalized',
          entityId: '',
          entityType: '',
          idPattern: '',
          attrs: '',
          sysAttrs: 'false',
          query: '',
          csf: '',
          georel: '',
          geometry: '',
          coordinates: '',
          geoproperty: '',
          geometryProperty: '',
          lang: '',
          accept: 'application/ld+json',
          atContext: '',
          buffering: 'on'
        };
        const brokerConfig = {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          getToken: () => {},
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
        };

        const node = { msg: '' };
        const param1 = createParam.call(node, msg, config, brokerConfig);
        const param2 = createParam.call(node, msg, config, brokerConfig);

        // Check that params are not the same instance
        assert.notEqual(param1, param2);
      });

      it('should create a nobuffering object', () => {
        const createParam = entitiesNode.__get__('createParam');
        const msg = { payload: { idPattern: '.*' } };
        const config = {
          representation: 'normalized',
          entityId: '',
          entityType: '',
          idPattern: '',
          attrs: '',
          sysAttrs: 'false',
          query: '',
          csf: '',
          georel: '',
          geometry: '',
          coordinates: '',
          geoproperty: '',
          geometryProperty: '',
          lang: '',
          accept: 'application/ld+json',
          atContext: '',
          buffering: 'off'
        };
        const brokerConfig = {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          getToken: () => {},
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld'
        };

        const node = { msg: '' };
        const param1 = createParam.call(node, msg, config, brokerConfig);
        const param2 = createParam.call(node, msg, config, brokerConfig);

        // Check that params are not the same instance
        assert.notEqual(param1, param2);
      });
    });
  });

  describe('NGSI-LD entities node', () => {
    afterEach(() => {
      entitiesNode.__ResetDependency__('lib');
    });
    it('get entities', async () => {
      entitiesNode.__set__('lib', {
        http: async () =>
          Promise.resolve({
            status: 200,
            headers: { 'NGSILD-Results-Count': 2 },
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
            ]
          }),
        buildHTTPHeader: () => {
          return {};
        },
        buildParams: () => new URLSearchParams(),
        isStringOrJson: () => {
          return true;
        },
        decodeNGSI: (data) => data
      });
      const red = new MockRed();
      entitiesNode(red);
      red.createNode({
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null
        }
      });

      await red.inputWithAwait({ payload: '.*' });

      assert.deepEqual(red.getOutput(), {
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
        ],
        statusCode: 200
      });
    });
    it('Error createParam', async () => {
      const red = new MockRed();
      entitiesNode(red);
      red.createNode({
        representation: 'normalized',
        entityId: '',
        entityType: '',
        idPattern: '',
        attrs: '',
        sysAttrs: 'false',
        query: '',
        csf: '',
        georel: '',
        geometry: '',
        coordinates: '',
        geoproperty: '',
        geometryProperty: '',
        lang: '',
        accept: 'application/ld+json',
        atContext: '',
        buffering: 'off',

        broker: {
          apiEndpoint: 'http://orion-ld:1026',
          mintaka: '',
          tenant: 'openiot',
          atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
          getToken: null
        }
      });

      await red.inputWithAwait({ payload: { lang: true } });

      assert.deepEqual(red.getOutput(), {
        payload: { error: 'lang not string' },
        statusCode: 500
      });
      assert.equal(red.getMessage(), 'lang not string');
    });
  });
});
