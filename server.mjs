import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, isAbsolute, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));
const languages = new Set(['es', 'en', 'de', 'it']);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8'
};

function choose(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function parseModel(source) {
  const knownWords = new Set();
  const starts = [];
  const transitions = new Map();
  let length = 4;

  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith('@LENGTH ')) {
      length = Number(line.slice(8));
    } else if (line.startsWith('@WORD ')) {
      knownWords.add(line.slice(6));
    } else if (line.startsWith('@SUBS ')) {
      const [gram, count] = line.slice(6).split(/\s+/);
      const prefix = gram.slice(0, -1);
      const options = transitions.get(prefix) ?? [];
      const option = { gram, count: Number(count) };
      options.push(option);
      transitions.set(prefix, options);
      if (gram.startsWith('#')) starts.push(option);
    }
  }

  return { knownWords, length, starts, transitions, words: [...knownWords] };
}

function weightedChoice(options) {
  const total = options.reduce((sum, option) => sum + option.count, 0);
  let ticket = Math.random() * total;
  for (const option of options) {
    ticket -= option.count;
    if (ticket < 0) return option.gram;
  }
  return options.at(-1).gram;
}

function generateWord(model) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    let decorated = weightedChoice(model.starts);
    while (decorated.length < 40) {
      const prefix = decorated.slice(-(model.length - 1));
      const options = model.transitions.get(prefix);
      if (!options) break;

      decorated += weightedChoice(options).at(-1);
      if (decorated.endsWith('#')) {
        const word = decorated.slice(1, -1);
        if (word && !model.knownWords.has(word)) return word;
        break;
      }
    }
  }

  throw new Error('Could not generate a new word');
}

async function loadModels(directory = rootDirectory) {
  const entries = await Promise.all(
    [...languages].map(async (language) => {
      const source = await readFile(join(directory, 'models', `${language}.model`), 'utf8');
      return [language, parseModel(source)];
    })
  );
  return new Map(entries);
}

function sendJson(response, status, value) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(value));
}

function safeFilePath(pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = resolve(rootDirectory, `.${normalize(requestedPath)}`);
  const pathFromRoot = relative(rootDirectory, filePath);
  return pathFromRoot && !pathFromRoot.startsWith('..') && !isAbsolute(pathFromRoot) ? filePath : null;
}

export async function createApp() {
  const models = await loadModels();

  return createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);
    if (url.pathname === '/health') {
      sendJson(response, 200, { status: 'ok' });
      return;
    }

    if (url.pathname === '/api/word') {
      const language = url.searchParams.get('lang') ?? 'es';
      if (!models.has(language)) {
        sendJson(response, 400, { error: 'lang must be one of es, en, de, it' });
        return;
      }

      const model = models.get(language);
      const real = Math.random() < 0.5;
      sendJson(response, 200, { word: real ? choose(model.words) : generateWord(model), real });
      return;
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { allow: 'GET, HEAD' });
      response.end();
      return;
    }

    const filePath = safeFilePath(url.pathname);
    if (!filePath) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    try {
      const file = await readFile(filePath);
      response.writeHead(200, { 'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream' });
      response.end(request.method === 'HEAD' ? undefined : file);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3000);
  const server = await createApp();
  server.listen(port, () => console.log(`NaiveWord listening on http://localhost:${port}`));
}
