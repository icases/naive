import assert from 'node:assert/strict';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
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

test('uses HTTPS dictionary links', async () => {
  const client = await readFile(new URL('../js/words.js', import.meta.url), 'utf8');
  assert.doesNotMatch(client, /http:\/\//);
  assert.match(client, /https:\/\/dle\.rae\.es/);
});

test('does not load legacy UI libraries', async () => {
  for (const page of ['index.html', 'how-to.html', 'contacto.html']) {
    const source = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /jquery|bootstrap/i);
  }
});

test('ships translated information pages', async () => {
  const script = await readFile(new URL('../js/info-pages.js', import.meta.url), 'utf8');
  for (const language of ['es', 'en', 'it', 'de']) {
    assert.match(script, new RegExp(`${language}: \\{ picker:`));
  }
  for (const page of ['how-to.html', 'contacto.html']) {
    const source = await readFile(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.match(source, /js\/info-pages\.js/);
    assert.match(source, /id="languagePicker"/);
  }
});

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
  assert.match(page, /id=['"]streak['"]/);
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
