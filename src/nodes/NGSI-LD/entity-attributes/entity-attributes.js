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

'use strict';

const lib = require('../../../lib.js');

const updateAttrs = async function (msg, param) {
  const options = {
    method: param.method,
    baseURL: param.host,
    url: param.pathname,
    headers: await lib.buildHTTPHeader(param),
    params: lib.buildParams(param.config),
  };

  options.data = lib.encodeNGSI(param.config.attributes, param.config.forbidden);

  try {
    const res = await lib.http(options);
    msg.payload = res.data;
    msg.statusCode = Number(res.status);
    if (res.status === 204) {
      return;
    } else {
      this.error(`Error while updating attributes: ${res.status} ${res.statusText}`);
      if (res.data) {
        this.error('Error details: ' + JSON.stringify(res.data));
      }
      return;
    }
  } catch (error) {
    this.error(`Exception while updating attributes: ${error.message}`);
    msg.payload = { error: error.message };
    msg.statusCode = 500;
  }
};

const validateConfig = function (msg, config) {
  if (typeof config.entityId !== 'string') {
    msg.payload = { error: 'entityId not string' };
    return false;
  }

  if (typeof config.forbidden !== 'boolean') {
    msg.payload = { error: 'forbidden not boolean' };
    return false;
  }

  if (config.entityId === '') {
    msg.payload = { error: 'entityId is empty' };
    return false;
  }

  if (!lib.isJson(config.attributes)) {
    msg.payload = { error: 'attributes not JSON Object' };
    return false;
  }

  return true;
};

const createParam = function (msg, config, brokerConfig) {
  if (!lib.isJson(msg.payload)) {
    msg.payload = { error: 'payload not JSON Object' };
    return null;
  }

  const defaultConfig = {
    tenant: brokerConfig.tenant.trim(),
    atContext: config.atContext === '' ? brokerConfig.atContext.trim() : config.atContext.trim(),
    actionType: config.actionType,
    entityId: config.entityId.trim(),
    attributes: msg.payload,
    forbidden: config.forbidden ? config.forbidden === 'true' : false,
  };

  if (msg.payload.entityId && msg.payload.attrs) {
    defaultConfig.entityId = msg.payload.entityId;
    defaultConfig.attributes = msg.payload.attrs;
  }

  const param = {
    host: brokerConfig.apiEndpoint,
    pathname: '/ngsi-ld/v1/entities/' + defaultConfig.entityId + '/attrs',
    getToken: brokerConfig.getToken === null ? null : brokerConfig.getToken.bind(brokerConfig),
    config: defaultConfig,
  };

  switch (defaultConfig.actionType) {
    case 'append':
      param.method = 'post';
      param.config.noOverwrite = true;
      break;
    case 'upsert':
      param.method = 'post';
      break;
    case 'update':
      param.method = 'patch';
      break;
    default:
      msg.payload = { error: 'ActionType error: ' + defaultConfig.actionType };
      return null;
  }

  if (!validateConfig(msg, param.config)) {
    return null;
  }

  return param;
};

module.exports = function (RED) {
  function entityAttributes(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const brokerConfig = RED.nodes.getNode(config.broker);

    node.on('input', async function (msg) {
      const param = createParam(msg, config, brokerConfig);

      if (param) {
        await updateAttrs.call(node, msg, param);
      } else {
        node.error(msg.payload.error);
        msg.statusCode = 500;
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType('NGSI-LD entity attributes', entityAttributes);
};
