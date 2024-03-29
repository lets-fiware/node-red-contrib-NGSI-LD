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

const getVersion = async function (msg, param) {
  const options = {
    method: 'get',
    baseURL: param.host,
    headers: await lib.buildHTTPHeader(param),
    url: param.pathname
  };

  try {
    const res = await lib.http(options);
    msg.payload = res.data;
    msg.statusCode = Number(res.status);
    if (res.status === 200) {
      return;
    } else {
      this.error(`Error while getting version: ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    this.error(`Exception while getting version: ${error.message}`);
    msg.payload = { error: error.message };
    msg.statusCode = 500;
  }
};

module.exports = function (RED) {
  function BrokerVersion(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const brokerConfig = RED.nodes.getNode(config.broker);

    node.on('input', async function (msg) {
      if (brokerConfig.brokerType === 'orion-ld') {
        const param = {
          host: brokerConfig.apiEndpoint,
          pathname: '/ngsi-ld/ex/v1/version',
          getToken: brokerConfig.getToken === null ? null : brokerConfig.getToken.bind(brokerConfig)
        };
        await getVersion.call(node, msg, param);
      } else {
        msg.payload = { error: 'Broker not Orion-LD' };
        msg.statusCode = 500;
        node.error(msg.payload.error);
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType('NGSI-LD broker version', BrokerVersion);
};
