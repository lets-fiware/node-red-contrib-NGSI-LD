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

const httpRequest = async function (msg, param) {
  const options = {
    method: param.method,
    baseURL: param.host,
    url: param.pathname,
    headers: await lib.buildHTTPHeader(param),
    params: lib.buildParams(param.config),
  };

  if (param.config.actionType === 'create') {
    options.data = lib.encodeNGSI(param.config.entity, param.config.forbidden);
  }

  try {
    const res = await lib.http(options);
    msg.payload = res.data;
    msg.statusCode = Number(res.status);
    if (res.status === 200 && param.config.actionType === 'read') {
      msg.payload = lib.decodeNGSI(res.data, param.config.forbidden);
      return;
    } else if (res.status === 201 && param.config.actionType === 'create') {
      return;
    } else if (res.status === 204 && param.config.actionType === 'delete') {
      return;
    } else {
      this.error(`Error while managing entity: ${res.status} ${res.statusText}`);
      if (res.data) {
        this.error('Error details: ' + JSON.stringify(res.data));
      }
    }
  } catch (error) {
    this.error(`Exception while managing entity: ${error.message}`);
    msg.payload = { error: error.message };
    msg.statusCode = 500;
  }
};

const validateConfig = function (msg, config) {
  if (config.entityId === '' && (config.actionType === 'read' || config.actionType === 'delete')) {
    msg.payload = { error: 'Entity id not found' };
    return false;
  }

  if (typeof config.entity !== 'undefined' && !lib.isJson(config.entity)) {
    msg.payload = { error: 'Payload not JSON Object' };
    return false;
  }

  const items = [
    'atContext',
    'representation',
    'entityId',
    'attrs',
    'geometryProperty',
    'lang',
    'accept'
  ];
  for (let i = 0; i < items.length; i++) {
    const e = items[i];
    if (config[e] && typeof config[e] !== 'string') {
      msg.payload = { error: e + ' not string' };
      return false;
    }
  }

  const boolean_items = [
    'sysAttrs',
    'forbidden'
  ];
  for (let i = 0; i < boolean_items.length; i++) {
    const e = boolean_items[i];
    if (config[e] && typeof config[e] !== 'boolean') {
      msg.payload = { error: e + ' not boolean' };
      return false;
    }
  }

  return true;
};

const createParam = function (msg, config, brokerConfig) {
  if (!lib.isStringOrJson(msg.payload)) {
    msg.payload = { error: 'Payload not stirng or JSON Object' };
    return null;
  }

  const param = {
    host: brokerConfig.apiEndpoint,
    pathname: '/ngsi-ld/v1/entities/',
    getToken: brokerConfig.getToken === null ? null : brokerConfig.getToken.bind(brokerConfig),
    config: {
      tenant: brokerConfig.tenant.trim(),
      atContext: config.atContext === '' ? brokerConfig.atContext.trim() : config.atContext.trim(),
      actionType: config.actionType,
      entityId: config.entityId.trim(),
    },
  };

  const defaultConfig = {
    attrs: config.attrs.trim(),
    representation: config.representation,
    sysAttrs: config.sysAttrs === 'true',
    geometryProperty: config.geometryProperty,
    lang: config.lang,
    accept: config.accept,
    forbidden: config.forbidden ? config.forbidden === 'true' : false,
  };

  if (typeof msg.payload === 'string') {
    param.config.entityId = msg.payload;
  } else {
    [
      'entityId',
      'attrs',
      'representation',
      'sysAttrs',
      'geometryProperty',
      'lang',
      'accept',
      'forbidden'
    ].forEach(e => {
      if (msg.payload[e]) {
        defaultConfig[e] = msg.payload[e];
      }
    });
  }

  switch (param.config.actionType) {
    case 'create':
      param.method = 'post';
      param.config.entity = msg.payload;
      param.config.forbidden = defaultConfig.forbidden;
      break;
    case 'read':
      param.method = 'get';
      param.config = Object.assign(param.config, defaultConfig);
      param.pathname += param.config.entityId;
      break;
    case 'delete':
      param.method = 'delete';
      param.pathname += param.config.entityId;
      break;
    default:
      msg.payload = { error: 'ActionType error: ' + param.config.actionType };
      return null;
  }
  delete param.config.entityId;

  if (!validateConfig(msg, param.config)) {
    return null;
  }

  return param;
};

module.exports = function (RED) {
  function entityNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const brokerConfig = RED.nodes.getNode(config.broker);

    node.on('input', async function (msg) {
      const param = createParam(msg, config, brokerConfig);

      if (param) {
        await httpRequest.call(node, msg, param);
      } else {
        node.error(msg.payload.error);
        msg.statusCode = 500;
      }
      node.send(msg);
    });
  }
  RED.nodes.registerType('NGSI-LD Entity', entityNode);
};
