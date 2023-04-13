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

const sourceNode = require('../../src/nodes/NGSI-LD/version/version.js');
const MockRed = require('./helpers/mockred.js');

const orion_version = JSON.parse('{"Orion-LD version":"1.1.2","based on orion":"1.15.0-next","kbase version":"0.8","kalloc version":"0.8","khash version":"0.8","kjson version":"0.8.2","microhttpd version":"0.9.75-0","rapidjson version":"1.0.2","libcurl version":"7.61.1","libuuid version":"UNKNOWN","mongocpp version":"1.1.3","mongoc version":"1.22.0","bson version":"1.22.0","mongodb server version":"4.4.19","boost version":"1_66","openssl version":"OpenSSL 1.1.1k  FIPS 25 Mar 2021","postgres libpq version":"15.0.0","postgres server version":"12.0.6","branch":"","cached subscriptions":0,"Next File Descriptor":28}');

describe('version.js', () => {
  describe('getVersion', () => {
    it('get version', async () => {
      sourceNode.__set__('lib', {
        http: async () => Promise.resolve({
          status: 200,
          data: orion_version
        }),
        buildHTTPHeader: () => { return {}; },
        buildSearchParams: () => new URLSearchParams(),
      });
      const getVersion = sourceNode.__get__('getVersion');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/version'
      };

      const res = await getVersion(param);

      assert.equal(res, orion_version);
    });
    it('should be 400 Bad Request', async () => {
      sourceNode.__set__('lib', {
        http: async () => Promise.resolve({ status: 400, statusText: 'Bad Request' }),
        buildHTTPHeader: () => { return {}; },
        buildSearchParams: () => new URLSearchParams(),
      });
      const getVersion = sourceNode.__get__('getVersion');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/version'
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };
      const res = await getVersion.call(node, param);

      assert.equal(res, null);
      assert.equal(msg, 'Error while getting version: 400 Bad Request');
    });
    it('Should be unknown error', async () => {
      sourceNode.__set__('lib', {
        http: async () => Promise.reject('unknown error'),
        buildHTTPHeader: () => { return {}; },
        buildSearchParams: () => new URLSearchParams(),
      });
      const getVersion = sourceNode.__get__('getVersion');

      const param = {
        host: 'http://orion-ld:1026',
        pathname: '/version'
      };

      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };
      const res = await getVersion.call(node, param);

      assert.equal(res, null);
      assert.equal(msg, 'Exception while getting version: unknown error');
    });
  });
  describe('Version node', () => {
    afterEach(() => {
      sourceNode.__ResetDependency__('getVersion');
    });
    it('orion version', async () => {
      const red = new MockRed();
      sourceNode(red);
      red.createNode({
        broker: {
          brokerType: 'orion-ld',
          apiEndpoint: 'http://orion-ld:1026',
          getToken: () => { },
        }
      });

      let actual;
      sourceNode.__set__('getVersion', (param) => { actual = param; return orion_version; });

      await red.inputWithAwait({ payload: null });

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/ex/v1/version');
      const output = red.getOutput();
      assert.equal(output.payload, orion_version);
    });
    it('orion version without getToken', async () => {
      const red = new MockRed();
      sourceNode(red);
      red.createNode({
        broker: {
          brokerType: 'orion-ld',
          apiEndpoint: 'http://orion-ld:1026',
          getToken: null,
        }
      });

      let actual;
      sourceNode.__set__('getVersion', (param) => { actual = param; return orion_version; });

      await red.inputWithAwait({ payload: null });

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/ex/v1/version');
      const output = red.getOutput();
      assert.equal(output.payload, orion_version);
    });
    it('error', async () => {
      const red = new MockRed();
      sourceNode(red);
      red.createNode({
        broker: {
          brokerType: 'orion-ld',
          apiEndpoint: 'http://orion-ld:1026',
          getToken: () => { },
        }
      });

      let actual;
      sourceNode.__set__('getVersion', (param) => { actual = param; return null; });

      await red.inputWithAwait({ payload: null });

      assert.equal(actual.host, 'http://orion-ld:1026');
      assert.equal(actual.pathname, '/ngsi-ld/ex/v1/version');
      const output = red.getOutput();
      assert.deepEqual(output, []);
    });
    it('not Orion-LD', async () => {
      const red = new MockRed();
      sourceNode(red);
      red.createNode({
        broker: {
          brokerType: 'orion',
          apiEndpoint: 'http://orion-ld:1026',
          getToken: () => { },
        }
      });

      await red.inputWithAwait({ payload: null });

      assert.equal(red.getMessage(), 'not Orion-LD');
    });
  });
});
