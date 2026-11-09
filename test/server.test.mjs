import assert from 'node:assert/strict';
import { once } from 'node:events';
import test from 'node:test';

import { createApp } from '../server.mjs';

let server;
let baseUrl;

test.before(async () => {
  server = await createApp();
  server.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

test('reports its health', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('serves the game page', async () => {
  const response = await fetch(`${baseUrl}/`);
  assert.equal(response.status, 200);
  const page = await response.text();
  assert.match(page, /NaiveWord/);
  assert.match(page, /id="languagePicker"/);
  for (const language of ['es', 'en', 'it', 'de']) {
    assert.match(page, new RegExp(`<option value="${language}">`));
  }
});

test('returns words for each supported language', async () => {
  for (const language of ['es', 'en', 'de', 'it']) {
    const response = await fetch(`${baseUrl}/api/word?lang=${language}`);
    assert.equal(response.status, 200);
    const word = await response.json();
    assert.equal(typeof word.word, 'string');
    assert.ok(word.word.length > 0);
    assert.equal(typeof word.real, 'boolean');
  }
});

test('rejects unsupported languages', async () => {
  const response = await fetch(`${baseUrl}/api/word?lang=fr`);
  assert.equal(response.status, 400);
});
