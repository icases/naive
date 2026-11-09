# NaiveWord

NaiveWord asks whether a displayed word is real. It chooses real words and
generates plausible invented words from the bundled four-gram language models.

## Run locally

Node.js 18 or newer is the only requirement. No `npm install` step is needed.

```sh
npm start
```

Open `http://localhost:3000`. The server serves the static pages and provides
`GET /api/word?lang=es`, with `es`, `en`, `de`, and `it` as supported languages.

## Verify

```sh
npm test
```

The tests start the server, load the game page, request words for every
language, and confirm that invalid languages are rejected.
