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

const lib = require('../../src/lib.js');

describe('lib.js', () => {
  describe('http', () => {
    afterEach(() => {
      lib.__ResetDependency__('axios');
    });
    it('should be http 200 OK', async () => {
      lib.__set__('axios', async () => Promise.resolve({ status: 200 }));
      const actual = await lib.http({});

      assert.equal(actual.status, 200);
    });
    it('should be http 400 Bad request', async () => {
      const Mockaxios = async () => Promise.reject({ status: 400, response: 'Bad request' });
      Mockaxios.isAxiosError = () => true;
      lib.__set__('axios', Mockaxios);
      const actual = await lib.http({});

      assert.equal(actual, 'Bad request');
    });
    it('should be axios error', async () => {
      const Mockaxios = async () => Promise.reject({ status: 400 });
      Mockaxios.isAxiosError = () => true;
      lib.__set__('axios', Mockaxios);
      await lib.http({}).catch(() => {
      });
    });
    it('should be unknown exception', async () => {
      const Mockaxios = async () => Promise.reject({});
      Mockaxios.isAxiosError = () => false;
      lib.__set__('axios', Mockaxios);
      await lib.http({}).catch(() => {
      });
    });
  });

  describe('buildHTTPHeader', () => {
    it('Should be empty', async () => {
      const param = {};
      const actual = await lib.buildHTTPHeader(param);

      const expected = {};

      assert.deepEqual(actual, expected);
    });
    it('Has NGSILD-Tenant header', async () => {
      const param = { config: { tenant: 'openiot' } };
      const actual = await lib.buildHTTPHeader(param);

      const expected = { 'NGSILD-Tenant': 'openiot' };

      assert.deepEqual(actual, expected);
    });
    it('Has Link header', async () => {
      const param = { config: { atContext: 'https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld' } };
      const actual = await lib.buildHTTPHeader(param);

      const expected = {
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.6.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
        'Content-Type': 'application/json'
      };

      assert.deepEqual(actual, expected);
    });
    it('Has Accept header', async () => {
      const param = { config: { accept: 'application/json' } };
      const actual = await lib.buildHTTPHeader(param);

      const expected = { 'Accept': 'application/json' };

      assert.deepEqual(actual, expected);
    });
    it('Has Authorization header', async () => {
      const param = { getToken: async () => { return '3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4'; } };
      const actual = await lib.buildHTTPHeader(param);

      const expected = { 'Authorization': 'Bearer 3b7c02f9e8a0b8fb1ca0df27052b6dfc00f32df4' };

      assert.deepEqual(actual, expected);
    });
    it('Has application/json as Content-Type', async () => {
      const param = { contentType: 'application/json' };
      const actual = await lib.buildHTTPHeader(param);

      const expected = { 'Content-Type': 'application/json' };

      assert.deepEqual(actual, expected);
    });
  });
  describe('buildParams', () => {
    it('Empty param', () => {
      const param = {};
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), '');
    });
    it('type', () => {
      const param = { type: 'T1' };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'type=T1');
    });
    it('attrs', () => {
      const param = { attrs: 'A1,A2' };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'attrs=A1%2CA2');
    });
    it('q', () => {
      const param = { q: 'brandName!="Mercedes"' };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'q=brandName%21%3D%22Mercedes%22');
    });
    it('geo query', () => {
      const param = { georel: 'near', geometry: 'point', coordinates: '[-40.4,-3.5]', geoproperty: 'location', geometryProperty: 'position' };
      const actual = lib.buildParams(param);

      assert.equal(actual.get('georel'), 'near');
      assert.equal(actual.get('geometry'), 'point');
      assert.equal(actual.get('coordinates'), '[-40.4,-3.5]');
      assert.equal(actual.get('geoproperty'), 'location');
      assert.equal(actual.get('geometryProperty'), 'position');
    });
    it('lang', () => {
      const param = { lang: 'ja' };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'lang=ja');
    });
    it('limit, offset', () => {
      const param = { limit: 100, offset: 200 };
      const actual = lib.buildParams(param);

      assert.equal(actual.get('limit'), 100);
      assert.equal(actual.get('offset'), 200);
      assert.equal(actual.get('options'), null);
    });
    it('keyValues with sysAttrs', () => {
      const param = { representation: 'keyValues', sysAttrs: true };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=keyValues');
    });
    it('keyValues', () => {
      const param = { representation: 'keyValues', sysAttrs: false };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=keyValues');
    });
    it('concise', () => {
      const param = { representation: 'concise' };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=concise');
    });
    it('count', () => {
      const param = { count: true };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=count');
    });
    it('count is false', () => {
      const param = { count: false };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), '');
    });
    it('sysAttrs', () => {
      const param = { sysAttrs: true };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=sysAttrs');
    });
    it('temporalValues', () => {
      const param = { temporalValues: true };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=temporalValues');
    });
    it('aggregatedValues', () => {
      const param = { aggregatedValues: true };
      const actual = lib.buildParams(param);

      assert.equal(actual.toString(), 'options=aggregatedValues');
    });
    it('id, type param', () => {
      const param = { id: 'urn:ngsi-ld:Building:store001', type: 'Building', idPattern: '.*' };
      const actual = lib.buildParams(param);

      assert.equal(actual.get('options'), null);
      assert.equal(actual.get('id'), 'urn:ngsi-ld:Building:store001');
      assert.equal(actual.get('type'), 'Building');
      assert.equal(actual.get('idPattern'), '.*');
    });
  });
  describe('convertDateTime', () => {
    it('Empty value', () => {
      const dt = Date('2023-01-01T12:34:56.000Z');
      const value = '';
      const unit = 'day';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '');
    });
    it('years', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '-1';
      const unit = 'years';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2022-01-01T12:34:56.000Z');
    });
    it('months', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '-2';
      const unit = 'months';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2022-11-01T12:34:56.000Z');
    });
    it('days', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '3';
      const unit = 'days';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2022-12-29T12:34:56.000Z');
    });
    it('hours', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '-4';
      const unit = 'hours';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2023-01-01T08:34:56.000Z');
    });
    it('minutes', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '-5';
      const unit = 'minutes';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2023-01-01T12:29:56.000Z');
    });
    it('seconds', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '-6';
      const unit = 'seconds';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2023-01-01T12:34:50.000Z');
    });
    it('ISO8601', () => {
      const dt = new Date('2023-01-01T12:34:56.000Z');
      const value = '2024-01-01T12:34:56.000Z';
      const unit = 'ISO8601';

      const actual = lib.convertDateTime(dt, value, unit);

      assert.equal(actual, '2024-01-01T12:34:56.000Z');
    });
    it('dateTime not Number', () => {
      const dt = Date('2023-01-01T12:34:56.000Z');
      const value = '-a';
      const unit = 'day';
      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = lib.convertDateTime.call(node, dt, value, unit);

      assert.equal(actual, null);
      assert.equal(msg, 'dateTime not Number');
    });
    it('unit error', () => {
      const dt = Date('2023-01-01T12:34:56.000Z');
      const value = '-1';
      const unit = 'day';
      let msg = '';
      const node = { msg: '', error: (e) => { msg = e; } };

      const actual = lib.convertDateTime.call(node, dt, value, unit);

      assert.equal(actual, null);
      assert.equal(msg, 'Unit error: day');
    });
  });
  describe('isJson', () => {
    it('JSON', () => {
      const actual = lib.isJson({});

      const expected = true;

      assert.equal(actual, expected);
    });
  });
  describe('encodeforbiddenChar', () => {
    it('encode forbidden characters', () => {
      const actual = lib.encodeforbiddenChar('%<>"\'=;()%<>"\'=;()%<>"\'=;()%<>"\'=;()', true);

      const expected = '%25%3C%3E%22%27%3D%3B%28%29%25%3C%3E%22%27%3D%3B%28%29%25%3C%3E%22%27%3D%3B%28%29%25%3C%3E%22%27%3D%3B%28%29';

      assert.equal(actual, expected);
    });
    it('encode characters', () => {
      const actual = lib.encodeforbiddenChar('abc123', true);

      const expected = 'abc123';

      assert.deepEqual(actual, expected);
    });
  });
  describe('decodeforbiddenChar', () => {
    it('decode forbidden characters', () => {
      const actual = lib.decodeforbiddenChar('%25%3C%3E%22%27%3D%3B%28%29%25%3C%3E%22%27%3D%3B%28%29%25%3C%3E%22%27%3D%3B%28%29%25%3C%3E%22%27%3D%3B%28%29', true);

      const expected = '%<>"\'=;()%<>"\'=;()%<>"\'=;()%<>"\'=;()';

      assert.equal(actual, expected);
    });
    it('decode characters', () => {
      const actual = lib.decodeforbiddenChar('abc123', true);

      const expected = 'abc123';

      assert.deepEqual(actual, expected);
    });
  });
  describe('replaceObject', () => {
    let replaceObject;
    before(() => {
      replaceObject = lib.__get__('replaceObject');
    });
    it('string', () => {
      const actual = replaceObject({ test: '<>' }, lib.encodeforbiddenChar);

      const expected = { test: '%3C%3E' };

      assert.deepEqual(actual, expected);
    });
    it('JSON Object', () => {
      const actual = replaceObject({ test: { test2: '<>' } }, lib.encodeforbiddenChar);

      const expected = { test: { test2: '%3C%3E' } };

      assert.deepEqual(actual, expected);
    });
    it('JSON Array', () => {
      const actual = replaceObject({ test: ['<>'] }, lib.encodeforbiddenChar);

      const expected = { test: ['%3C%3E'] };

      assert.deepEqual(actual, expected);
    });
    it('Number', () => {
      const actual = replaceObject({ test: 123 }, lib.encodeforbiddenChar);

      const expected = { test: 123 };

      assert.deepEqual(actual, expected);
    });
  });
  describe('replaceArray', () => {
    let replaceArray;
    before(() => {
      replaceArray = lib.__get__('replaceArray');
    });
    it('string', () => {
      const actual = replaceArray(['<>'], lib.encodeforbiddenChar);

      const expected = ['%3C%3E'];

      assert.deepEqual(actual, expected);
    });
    it('JSON Object', () => {
      const actual = replaceArray([{ test: '<>' }], lib.encodeforbiddenChar);

      const expected = [{ test: '%3C%3E' }];

      assert.deepEqual(actual, expected);
    });
    it('JSON Array', () => {
      const actual = replaceArray([['<>']], lib.encodeforbiddenChar);

      const expected = [['%3C%3E']];

      assert.deepEqual(actual, expected);
    });
    it('Number', () => {
      const actual = replaceArray([123], lib.encodeforbiddenChar);

      const expected = [123];

      assert.deepEqual(actual, expected);
    });
  });
  describe('encodeNGSI', () => {
    it('string', () => {
      const actual = lib.encodeNGSI({ test: '<>' }, true);

      const expected = { test: '%3C%3E' };

      assert.deepEqual(actual, expected);
    });
    it('JSON Object', () => {
      const actual = lib.encodeNGSI({ test: { test2: '<>' } }, true);

      const expected = { test: { test2: '%3C%3E' } };

      assert.deepEqual(actual, expected);
    });
    it('JSON Array', () => {
      const actual = lib.encodeNGSI([{ test: ['<>'] }], true);

      const expected = [{ test: ['%3C%3E'] }];

      assert.deepEqual(actual, expected);
    });
    it('off', () => {
      const actual = lib.encodeNGSI({ test: '<>' }, false);

      const expected = { test: '<>' };

      assert.deepEqual(actual, expected);
    });
  });
  describe('decodeNGSI', () => {
    it('string', () => {
      const actual = lib.decodeNGSI({ test: '%3C%3E' }, true);

      const expected = { test: '<>' };

      assert.deepEqual(actual, expected);
    });
    it('JSON Object', () => {
      const actual = lib.decodeNGSI({ test: { test2: '%3C%3E' } }, true);

      const expected = { test: { test2: '<>' } };

      assert.deepEqual(actual, expected);
    });
    it('JSON Array', () => {
      const actual = lib.decodeNGSI([{ test: ['%3C%3E'] }], true);

      const expected = [{ test: ['<>'] }];

      assert.deepEqual(actual, expected);
    });
    it('off', () => {
      const actual = lib.decodeNGSI({ test: '<>' }, false);

      const expected = { test: '<>' };

      assert.deepEqual(actual, expected);
    });
  });
});
