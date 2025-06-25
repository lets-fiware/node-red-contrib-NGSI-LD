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

const getEntities = async function (msg, param) {
  let totalCount = 0;
  param.config.count = true;

  do {
    const options = {
      method: 'get',
      baseURL: param.host,
      url: param.pathname,
      headers: await lib.buildHTTPHeader(param),
      params: lib.buildParams(param.config)
    };

    try {
      const res = await lib.http(options);
      if (res.status === 200) {
        param.buffer.send(lib.decodeNGSI(res.data, param.config.forbidden));
        if (res.data.length === 0) {
          break;
        }
        param.config.offset += param.config.limit;
        if (totalCount <= 0) {
          totalCount = Number(res.headers['NGSILD-Results-Count']);
          if (totalCount <= 0) {
            break;
          }
        }
      } else {
        this.error(`Error while retrieving entities: ${res.status} ${res.statusText}`);
        if (res.data) {
          this.error('Error details: ' + JSON.stringify(res.data));
        }
        msg.payload = res.data;
        msg.statusCode = Number(res.status);
        this.send(msg);
        break;
      }
    } catch (error) {
      this.error(`Exception while retrieving entities: ${error.message}`);
      msg.payload = { error: error.message };
      msg.statusCode = 500;
      this.send(msg);
      break;
    }
  } while (param.config.offset < totalCount);

  param.buffer.close();
};

const validateConfig = function (msg, config) {
  const items = [
    'atContext',
    'representation',
    'id',
    'type',
    'idPattern',
    'attrs',
    'q',
    'csf',
    'georel',
    'geometry',
    'coordinates',
    'geoproperty',
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

  const boolean_items = ['buffering', 'sysAttrs', 'forbidden'];
  for (let i = 0; i < boolean_items.length; i++) {
    const e = boolean_items[i];
    if (config[e] && typeof config[e] !== 'boolean') {
      msg.payload = { error: e + ' not boolean' };
      return false;
    }
  }

  if (config.limit && typeof config.limit !== 'number') {
    msg.payload = { error: 'limit not number' };
    return false;
  }

  if (config.offset && typeof config.offset !== 'number') {
    msg.payload = { error: 'offset not number' };
    return false;
  }

  return true;
};

const createParam = function (msg, config, brokerConfig) {
  if (!lib.isStringOrJson(msg.payload)) {
    msg.payload = { error: 'Payload not stirng or JSON Object' };
    return null;
  }

  if (typeof msg.payload === 'string') {
    msg.payload = { idPattern: msg.payload.trim() };
  }

  const param = {
    host: brokerConfig.apiEndpoint,
    pathname: '/ngsi-ld/v1/entities/',
    getToken: brokerConfig.getToken === null ? null : brokerConfig.getToken.bind(brokerConfig),
    config: {
      tenant: brokerConfig.tenant.trim(),
      atContext: config.atContext === '' ? brokerConfig.atContext.trim() : config.atContext.trim(),
      representation: config.representation,
      id: config.entityId.trim(),
      type: config.entityType.trim(),
      idPattern: config.idPattern.trim(),
      attrs: config.attrs.trim(),
      sysAttrs: config.sysAttrs === 'true',
      q: config.query.trim(),
      csf: config.csf.trim(),
      georel: config.georel.trim(),
      geometry: config.geometry.trim(),
      coordinates: config.coordinates.trim(),
      geoproperty: config.geoproperty.trim(),
      geometryProperty: config.geometryProperty.trim(),
      lang: config.lang.trim(),
      accept: config.accept.trim(),
      buffering: config.buffering === 'on',
      forbidden: config.forbidden ? config.forbidden === 'true' : false,
      limit: 100,
      offset: 0
    }
  };

  [
    'representation',
    'id',
    'type',
    'idPattern',
    'attrs',
    'sysAttrs',
    'q',
    'csf',
    'georel',
    'geometry',
    'coordinates',
    'geoproperty',
    'geometryProperty',
    'lang',
    'accept',
    'buffering',
    'forbidden',
    'limit',
    'offset'
  ].forEach((e) => {
    if (msg.payload[e]) {
      param.config[e] = msg.payload[e];
    }
  });

  if (!validateConfig(msg, param.config)) {
    return null;
  }

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

  param.buffer = param.config.buffering ? buffering.open(this, msg) : nobuffering.open(this, msg);

  return param;
};

module.exports = function (RED) {
  function entitiesNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    const brokerConfig = RED.nodes.getNode(config.broker);

    node.on('input', async function (msg) {
      const param = createParam.call(node, msg, config, brokerConfig);

      if (param) {
        await getEntities.call(node, msg, param);
      } else {
        node.error(msg.payload.error);
        msg.statusCode = 500;
        node.send(msg);
      }
    });
  }
  RED.nodes.registerType('NGSI-LD entities', entitiesNode);
};
