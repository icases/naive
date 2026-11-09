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
Use the compact selector in the top-right corner to switch the game interface
and word model between Spanish, English, Italian, and German.


## Verify

```sh
npm test
```

The tests start the server, load the game page, request words for every
language, and confirm that invalid languages are rejected.

To run the optional browser test, install Playwright locally or point to an
existing installation and Chromium executable:

```sh
PLAYWRIGHT_MODULE_PATH=/path/to/playwright CHROMIUM_PATH=/path/to/chromium npm run test:browser
```

## Deploy on Render

`render.yaml` defines a free Node web service. Create a Render account, connect
GitHub, and choose **New + → Blueprint** for this repository. Select
`codex/javascript-rewrite` to test this branch, or `master` after merging it.
Render runs `npm test`, starts the app with `npm start`, and redeploys after
each commit to the selected branch. No application secret is required.
