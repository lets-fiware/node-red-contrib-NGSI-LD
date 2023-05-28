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

const brokerNode = require('../../src/nodes/NGSI-LD/ngsi-ld-broker/ngsi-ld-broker.js');
const MockRed = require('./helpers/mockred.js');

describe('ngsi-ld-broker.js', () => {
  describe('urlValidator', () => {
    let urlValidator;
    before(() => {
      urlValidator = brokerNode.__get__('urlValidator');
    });
    after(() => {
      brokerNode.__ResetDependency__('urlValidator');
    });
    it('should be http://orion-ld:1026', async () => {
      const actual = urlValidator('http://orion-ld:1026');
      assert.equal(actual, 'http://orion-ld:1026');
    });
    it('should be http://orion-ld:1026', async () => {
      const actual = urlValidator('http://orion-ld:1026/');
      assert.equal(actual, 'http://orion-ld:1026');
    });
    it('should be http://orion-ld:1026', async () => {
      const actual = urlValidator('http://orion-ld:1026/version');
      assert.equal(actual, 'http://orion-ld:1026/version');
    });
    it('should be null', async () => {
      const actual = urlValidator('');
      assert.equal(actual, null);
    });
    it('should be null', async () => {
      const actual = urlValidator('http://');
      assert.equal(actual, null);
    });
    it('should be null', async () => {
      const actual = urlValidator('mail://');
      assert.equal(actual, null);
    });
  });
  describe('getToken', () => {
    let getToken;
    before(() => {
      getToken = brokerNode.__get__('getToken');
    });
    after(() => {
      brokerNode.__ResetDependency__('getToken');
    });
    afterEach(() => {
      brokerNode.__ResetDependency__('http');
    });
    it('should get cached access token', async () => {
      const config = {
        accessToken: '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4',
        tokenExpires: new Date(Date.now() + 10 * 1000)
      };
      const actual = await getToken.call(config);
      assert.equal(actual, '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4');
    });
    it('should get access token', async () => {
      const config = {
        idmType: 'tokenproxy',
        idmEndpoint: 'http://orion-ld:1026',
        credentials: {
          username: 'fiware',
          password: '1234',
          clientid: null,
          clientsecret: null
        },
        accessToken: '',
        tokenExpires: null
      };
      brokerNode.__set__('http', async () => {
        return {
          status: 200,
          data: {
            access_token: '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4',
            token_type: 'bearer',
            expires_in: 3599,
            refresh_token: '8b23aeabcb97b2b6b09670c8fa4c448a46ab5268',
            scope: ['bearer']
          }
        };
      });
      const actual = await getToken.call(config);
      assert.equal(actual, '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4');
    });
    it('should get access token', async () => {
      const config = {
        idmType: 'tokenproxy',
        idmEndpoint: 'http://orion-ld:1026/token',
        credentials: {
          username: 'fiware',
          password: '1234',
          clientid: null,
          clientsecret: null
        },
        accessToken: '',
        tokenExpires: null
      };
      brokerNode.__set__('http', async () => {
        return {
          status: 200,
          data: {
            access_token: '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4',
            token_type: 'bearer',
            expires_in: 3599,
            refresh_token: '8b23aeabcb97b2b6b09670c8fa4c448a46ab5268',
            scope: ['bearer']
          }
        };
      });
      const actual = await getToken.call(config);
      assert.equal(actual, '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4');
    });
    it('should get access token', async () => {
      const config = {
        idmType: 'keyrock',
        idmEndpoint: 'http://keyrock:3000',
        credentials: {
          username: 'fiware',
          password: '1234',
          clientid: '58de156f-0fec-400b-bc7c-86265a885bee',
          clientsecret: '921cf732-b39c-4e7c-815c-a91277e52b70'
        },
        accessToken: '',
        tokenExpires: null
      };
      brokerNode.__set__('http', async () => {
        return {
          status: 200,
          data: {
            access_token: '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4',
            token_type: 'bearer',
            expires_in: 3599,
            refresh_token: '8b23aeabcb97b2b6b09670c8fa4c448a46ab5268',
            scope: ['bearer']
          }
        };
      });
      const actual = await getToken.call(config);
      assert.equal(actual, '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4');
    });
    it('should get access token', async () => {
      const config = {
        idmType: 'generic',
        idmEndpoint: 'http://generic',
        credentials: {
          username: 'fiware',
          password: '1234',
          clientid: '58de156f-0fec-400b-bc7c-86265a885bee',
          clientsecret: '921cf732-b39c-4e7c-815c-a91277e52b70'
        },
        accessToken: '',
        tokenExpires: null
      };
      brokerNode.__set__('http', async () => {
        return {
          status: 200,
          data: {
            access_token: '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4',
            token_type: 'bearer',
            expires_in: 3599,
            refresh_token: '8b23aeabcb97b2b6b09670c8fa4c448a46ab5268',
            scope: ['bearer']
          }
        };
      });
      const actual = await getToken.call(config);
      assert.equal(actual, '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4');
    });
    it('should be 401 Unauthorized error', async () => {
      let message;
      const config = {
        idmType: 'generic',
        idmEndpoint: 'http://generic',
        credentials: {
          username: 'fiware',
          password: '1234',
          clientid: '58de156f-0fec-400b-bc7c-86265a885bee',
          clientsecret: '921cf732-b39c-4e7c-815c-a91277e52b70'
        },
        accessToken: '',
        tokenExpires: null,
        error: (msg) => {
          message = msg;
        }
      };
      brokerNode.__set__('http', async () => {
        return { status: 401, statusText: 'Unauthorized' };
      });
      await getToken.call(config);
      assert.equal(message, 'Error while obtaining token. Status Code: 401 Unauthorized');
    });
    it('should be unknown error', async () => {
      let message;
      const config = {
        idmType: 'generic',
        idmEndpoint: 'http://generic',
        credentials: {
          username: 'fiware',
          password: '1234',
          clientid: '58de156f-0fec-400b-bc7c-86265a885bee',
          clientsecret: '921cf732-b39c-4e7c-815c-a91277e52b70'
        },
        accessToken: '',
        tokenExpires: null,
        error: (msg) => {
          message = msg;
        }
      };
      brokerNode.__set__('http', async () => Promise.reject('unknown error'));
      await getToken.call(config);
      assert.equal(message, 'Exception while obtaining token: unknown error');
    });
  });
  describe('NGSI-LD broker node', () => {
    it('Init NGSI-LD broker node', async () => {
      const red = new MockRed();
      brokerNode(red);
      red.createNode({
        name: '',
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: 'http://orion-ld:1026',
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        idmEndpoint: '',
        idmType: ''
      });
    });
    it('Init NGSI-LD broker node', async () => {
      const red = new MockRed();
      brokerNode(red);
      red.createNode({
        name: '',
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: 'http://orion-ld:1026',
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        idmEndpoint: '',
        idmType: 'none'
      });
    });
    it('Init NGSI-LD broker node with IdM', async () => {
      const red = new MockRed();
      brokerNode(red);
      red.createNode({
        name: '',
        apiEndpoint: 'http://orion-ld:1026',
        mintaka: 'http://orion-ld:1026',
        tenant: 'openiot',
        atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld',
        idmEndpoint: '',
        idmType: 'keyrock'
      });
    });
  });
});
