/*
   MIT License

   Copyright 2023 Kazuhito Suda

   This file is part of node-red-contrib-NGSI-LD

   requests://github.com/lets-fiware/node-red-contrib-NGSI-LD

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

const httpRequest = async function (param) {
  const options = {
    method: param.method,
    baseURL: param.host,
    url: param.pathname,
    headers: await lib.buildHTTPHeader(param),
    params: lib.buildParams(param.config),
  };

  if (param.config.actionType === 'update') {
    options.data = param.config.attribute;
  }

  try {
    const res = await lib.http(options);
    if (res.status === 204) {
      return Number(res.status);
    } else {
      this.error(`Error while managing attribute: ${res.status} ${res.statusText}`);
      if (res.data) {
        this.error('Error details: ' + JSON.stringify(res.data));
      }
      return Number(res.status);
    }
  } catch (error) {
    this.error(`Exception while managing attribute: ${error}`);
    return null;
  }
};

const validateConfig = function (config) {
  const items = ['atContext', 'entityId', 'attrName', 'datasetid'];
  for (let i = 0; i < items.length; i++) {
    const e = items[i];
    if (config[e] && typeof config[e] !== 'string') {
      this.error(e + ' not string');
      return false;
    }
  }

  if (config.entityId === '') {
    this.error('entityId not found');
    return false;
  }

  if (config.attrName === '') {
    this.error('attrName not found');
    return false;
  }

  if (config.deleteAll && typeof config.deleteAll !== 'boolean') {
    this.error('deleteAll not boolean');
    return false;
  }

  if (config.actionType === 'update' && (!config.attribute || !lib.isJson(config.attribute))) {
    this.error('attribute not JSON Object');
    return false;
  }

  return true;
};

const createParam = function (msg, config, brokerConfig) {
  if (!lib.isStringOrJson(msg.payload)) {
    this.error('Payload not stirng or JSON Object');
    return null;
  }

  const defaultConfig = {
    tenant: brokerConfig.tenant.trim(),
    atContext: config.atContext === '' ? brokerConfig.atContext.trim() : config.atContext.trim(),
    actionType: config.actionType,
    entityId: config.entityId.trim(),
    attrName: config.attrName.trim(),
    deleteAll: config.deleteAll === 'true',
    datasetId: config.datasetId,
    attribute: null,
  };

  if (lib.isJson(msg.payload)) {
    if (msg.payload.attribute || defaultConfig.actionType === 'delete') {
      ['entityId', 'attrName', 'attribute', 'deleteAll', 'datasetid'].forEach(e => {
        if (msg.payload[e]) {
          defaultConfig[e] = msg.payload[e];
        }
      });
    } else {
      defaultConfig.attribute = msg.payload;
    }
  } else {
    defaultConfig.attrName = msg.payload;
  }

  const param = {
    host: brokerConfig.apiEndpoint,
    pathname: '/ngsi-ld/v1/entities/' + defaultConfig.entityId + '/attrs/' + defaultConfig.attrName,
    getToken: brokerConfig.getToken === null ? null : brokerConfig.getToken.bind(brokerConfig),
  };

  switch (defaultConfig.actionType) {
    case 'update':
      param.method = 'patch';
      delete defaultConfig.deleteAll;
      delete defaultConfig.datasetId;
      break;
    case 'delete':
      param.method = 'delete';
      break;
    default:
      this.error('ActionType error: ' + defaultConfig.actionType);
      return null;
  }

  param.config = defaultConfig;

  if (!validateConfig.call(this, param.config)) {
    return null;
  }

  return param;
};

module.exports = function (RED) {
  function entityAttribute(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const brokerConfig = RED.nodes.getNode(config.broker);

    node.on('input', async function (msg) {
      const param = createParam.call(node, msg, config, brokerConfig);

      if (param) {
        const result = await httpRequest.call(node, param);
        msg.payload = result;
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType('NGSI-LD entity attribute', entityAttribute);
};
