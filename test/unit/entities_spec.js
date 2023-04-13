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

const entitiesNode = require('../../src/nodes/NGSI-LD/entities/entities.js');
const MockRed = require('./helpers/mockred.js');

describe('entities.js', () => {
  describe('getEntities', () => {
    afterEach(() => {
      entitiesNode.__ResetDependency__('lib');
    });
    it('get entities', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          headers: { 'NGSILD-Results-Count': 2 },
          data: [
            { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
            { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }
          ],
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });

      const getEntities = entitiesNode.__get__('getEntities');
      const nobuffering = entitiesNode.__get__('nobuffering');

      let actual;
      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: (entities) => { actual = entities; } }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      await getEntities(param);

      assert.deepEqual(actual, {
        payload: [
          { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
          { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }
        ]
      });
    });
    it('get 4 entities', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          headers: { 'NGSILD-Results-Count': 4 },
          data: [
            { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
            { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }
          ],
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });

      const getEntities = entitiesNode.__get__('getEntities');
      const buffering = entitiesNode.__get__('buffering');

      let actual = [];
      const param = {
        method: 'get',
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: buffering.open({ send: (entities) => { actual = actual.concat(entities); } }, { payload: null }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      await getEntities(param);

      assert.deepEqual(actual, [{
        payload: [
          { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
          { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
          { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
          { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }
        ]
      }]);
    });
    it('empty', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          headers: { 'NGSILD-Results-Count': 0 },
          data: [],
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });

      const getEntities = entitiesNode.__get__('getEntities');
      const nobuffering = entitiesNode.__get__('nobuffering');

      let actual;
      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: (entities) => { actual = entities; } }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      await getEntities(param);

      assert.deepEqual(actual, { payload: [] });
    });
    it('NGSILD-Results-Count is 0', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          headers: { 'NGSILD-Results-Count': 0 },
          data: [{}],
        }),
        buildHTTPHeader: async () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });

      const getEntities = entitiesNode.__get__('getEntities');
      const nobuffering = entitiesNode.__get__('nobuffering');

      let actual;
      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: (entities) => { actual = entities; } }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      await getEntities(param);

      assert.deepEqual(actual, { payload: [{}] });
    });
    it('should be 400 Bad Request', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request' }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const getEntities = entitiesNode.__get__('getEntities');
      const nobuffering = entitiesNode.__get__('nobuffering');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: () => { } }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = await getEntities.call(node, param);

      assert.equal(actual, null);
      assert.equal(msg, 'Error while retrieving entities: 400 Bad Request');
    });
    it('should be 400 Bad Request with details', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request', data: { error: 'detail' } }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const getEntities = entitiesNode.__get__('getEntities');
      const nobuffering = entitiesNode.__get__('nobuffering');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: () => { } }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      let msg = [];
      const node = { msg: '', error: (e) => { msg.push(e); } };

      const actual = await getEntities.call(node, param);

      assert.equal(actual, null);
      assert.deepEqual(msg, [
        'Error while retrieving entities: 400 Bad Request',
        'Error details: {"error":"detail"}',
      ]);
    });
    it('Should be unknown error', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.reject('unknown error'),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
      });
      const getEntities = entitiesNode.__get__('getEntities');
      const nobuffering = entitiesNode.__get__('nobuffering');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/ngsi-ld/v1/entities/',
        buffer: nobuffering.open({ send: () => { } }),
        config: {
          offset: 0,
          limit: 2,
        }
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = await getEntities.call(node, param);

      assert.equal(actual, null);
      assert.equal(msg, 'Exception while retrieving entities: unknown error');
    });
  });
  describe('nobuffering', () => {
    it('should have a entity', () => {
      const nobuffering = entitiesNode.__get__('nobuffering');
      const msg = {};
      const actual = [];

      nobuffering.open({ send: (data) => { actual.push(data); } }, msg);
      nobuffering.send([{ id: 'E1', type: 'T' }]);
      nobuffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }] }]);

    });
    it('should have entities', () => {
      const nobuffering = entitiesNode.__get__('nobuffering');
      const msg = {};
      const actual = [];

      nobuffering.open({ send: (data) => { actual.push(data); } }, msg);
      nobuffering.send([{ id: 'E1', type: 'T' }]);
      nobuffering.send([{ id: 'E2', type: 'T' }]);
      nobuffering.close();

      assert.deepEqual(actual, [
        { payload: [{ id: 'E1', type: 'T' }] },
        { payload: [{ id: 'E2', type: 'T' }] },
      ]);
    });
    it('should be empty', () => {
      const nobuffering = entitiesNode.__get__('nobuffering');
      const msg = {};
      const actual = [];

      nobuffering.open({ send: (data) => { actual.push(data); } }, msg);
      nobuffering.close();

      assert.deepEqual(actual, []);

    });
    it('should have a entity', () => {
      const nobuffering = entitiesNode.__get__('nobuffering');
      const msg = {};
      const actual = [];

      nobuffering.open({ send: (data) => { actual.push(data); } }, msg);
      nobuffering.out([{ id: 'E1', type: 'T' }]);
      nobuffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }] }]);

    });
  });
  describe('buffering', () => {
    it('should have a entity', () => {
      const buffering = entitiesNode.__get__('buffering');
      const msg = {};
      const actual = [];

      buffering.open({ send: (data) => { actual.push(data); } }, msg);
      buffering.send([{ id: 'E1', type: 'T' }]);
      buffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }] }]);

    });
    it('should have a entities', () => {
      const buffering = entitiesNode.__get__('buffering');
      const msg = {};
      const actual = [];

      buffering.open({ send: (data) => { actual.push(data); } }, msg);
      buffering.send([{ id: 'E1', type: 'T' }]);
      buffering.send([{ id: 'E2', type: 'T' }]);
      buffering.close();

      assert.deepEqual(actual, [
        {
          payload: [
            { id: 'E1', type: 'T' },
            { id: 'E2', type: 'T' },
          ]
        },
      ]);
    });
    it('should be empty', () => {
      const buffering = entitiesNode.__get__('buffering');
      const msg = {};
      const actual = [];

      buffering.open({ send: (data) => { actual.push(data); } }, msg);
      buffering.close();

      assert.deepEqual(actual, [{ 'payload': [] }]);

    });
    it('should have a entity', () => {
      const buffering = entitiesNode.__get__('buffering');
      const msg = {};
      const actual = [];

      buffering.open({ send: (data) => { actual.push(data); } }, msg);
      buffering.out([{ id: 'E1', type: 'T' }]);
      buffering.close();

      assert.deepEqual(actual, [{ payload: [{ id: 'E1', type: 'T' }] }]);

    });
  });
  describe('validateConfig', () => {
    it('result true', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      const actual = validateConfig({});

      assert.equal(actual, true);
    });
    it('atContext not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { atContext: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'atContext not string');
    });
    it('representation not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { representation: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'representation not string');
    });
    it('id not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { id: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'id not string');
    });
    it('type not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { type: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'type not string');
    });
    it('idPattern not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { idPattern: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'idPattern not string');
    });
    it('attrs not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { attrs: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'attrs not string');
    });
    it('q not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { q: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'q not string');
    });
    it('csf not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { csf: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'csf not string');
    });
    it('georel not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { georel: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'georel not string');
    });
    it('geometry not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { geometry: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'geometry not string');
    });
    it('coordinates not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { coordinates: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'coordinates not string');
    });
    it('geoproperty not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { geoproperty: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'geoproperty not string');
    });
    it('geometryProperty not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { geometryProperty: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'geometryProperty not string');
    });
    it('lang not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { lang: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'lang not string');
    });
    it('accept not string', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { accept: 123 });

      assert.equal(actual, false);
      assert.equal(msg, 'accept not string');
    });
    it('buffering not boolean', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { buffering: 'true' });

      assert.equal(actual, false);
      assert.equal(msg, 'buffering not boolean');
    });
    it('sysAttrs not boolean', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { sysAttrs: 'true' });

      assert.equal(actual, false);
      assert.equal(msg, 'sysAttrs not boolean');
    });
    it('limit not number', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { limit: '123' });

      assert.equal(actual, false);
      assert.equal(msg, 'limit not number');
    });
    it('offset not number', () => {
      const validateConfig = entitiesNode.__get__('validateConfig');

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = validateConfig.call(node, { offset: '123' });

      assert.equal(actual, false);
      assert.equal(msg, 'offset not number');
    });
  });
  describe('createParam', () => {
    it('string param', () => {
      const createParam = entitiesNode.__get__('createParam');
      const msg = { payload: '.*' };
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
        limit: 100,
        offset: 0,
      });
    });
    it('object param', () => {
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
        buffering: 'off',
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
        limit: 100,
        offset: 0,
      });
    });
    it('getToken', () => {
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
        buffering: 'off',
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
        limit: 100,
        offset: 0,
      });
    });
    it('atContext', () => {
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
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.4.jsonld',
        buffering: 'off',
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
        limit: 100,
        offset: 0,
      }
      );
    });
    it('buffering', () => {
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
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        buffering: 'on',
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
        limit: 100,
        offset: 0,
      }
      );
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
        buffering: 'off',
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
        buffering: 'off',
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
      assert.equal(errmsg, 'lang not string');
    });
  });
  describe('NGSI-LD entities node', () => {
    afterEach(() => {
      entitiesNode.__ResetDependency__('lib');
    });
    it('get entities', async () => {
      entitiesNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          headers: { 'NGSILD-Results-Count': 2 },
          data: [
            { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
            { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }
          ],
        }),
        buildHTTPHeader: () => { return {}; },
        buildParams: () => new URLSearchParams(),
        isStringOrJson: () => { return true; },
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
          getToken: null,
        }
      });

      await red.inputWithAwait({ payload: '.*' });

      assert.deepEqual(red.getOutput(), {
        payload: [
          { 'id': 'urn:ngsi-ld:TemperatureSensor:001', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } },
          { 'id': 'urn:ngsi-ld:TemperatureSensor:002', 'type': 'TemperatureSensor', 'category': { 'type': 'Property', 'value': 'sensor' }, 'temperature': { 'type': 'Property', 'value': 25, 'unitCode': 'CEL' }, 'location': { 'type': 'GeoProperty', 'value': { 'type': 'Point', 'coordinates': [-73.975, 40.775556] } } }
        ]
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
          getToken: null,
        }
      });

      await red.inputWithAwait({ payload: { lang: true } });

      assert.equal(red.getMessage(), 'lang not string');
    });
  });
});
