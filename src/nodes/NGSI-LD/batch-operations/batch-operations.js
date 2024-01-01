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

'use strict';

const lib = require('../../../lib.js');

const batchOperations = async function (msg, param) {
  const options = {
    method: 'post',
    baseURL: param.host,
    url: param.pathname,
    headers: await lib.buildHTTPHeader(param),
    data: lib.encodeNGSI(param.config.data, param.config.forbidden)
  };

  try {
    const res = await lib.http(options);
    msg.payload = res.data;
    msg.statusCode = Number(res.status);
    if (res.status === 201 || res.status === 204) {
      return;
    } else {
      this.error(`Error while manipulating entities: ${res.status} ${res.statusText}`);
      if (res.data) {
        this.error('Error details: ' + JSON.stringify(res.data));
      }
    }
  } catch (error) {
    this.error(`Exception while manipulating entities: ${error.message}`);
    msg.payload = { error: error.message };
    msg.statusCode = 500;
  }
};

const createParam = function (msg, config, brokerConfig) {
  if (typeof msg.payload !== 'object') {
    msg.payload = { error: 'payload not JSON Object' };
    this.error(msg.payload.error);
    return null;
  }

  const defaultConfig = {
    tenant: brokerConfig.tenant.trim(),
    atContext: config.atContext === '' ? brokerConfig.atContext.trim() : config.atContext.trim(),
    data: Array.isArray(msg.payload) ? msg.payload : [msg.payload],
    accept: 'application/ld+json',
    forbidden: config.forbidden ? config.forbidden === 'true' : false
  };

  const param = {
    host: brokerConfig.apiEndpoint,
    pathname: '/ngsi-ld/v1/entityOperations/' + config.actionType.trim(),
    getToken: brokerConfig.getToken === null ? null : brokerConfig.getToken.bind(brokerConfig),
    config: defaultConfig
  };

  return param;
};

module.exports = function (RED) {
  function batchOperationsNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const brokerConfig = RED.nodes.getNode(config.broker);

    node.on('input', async function (msg) {
      const param = createParam.call(node, msg, config, brokerConfig);

      if (param) {
        await batchOperations.call(node, msg, param);
      } else {
        msg.statusCode = 500;
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType('NGSI-LD Batch operations', batchOperationsNode);
};
