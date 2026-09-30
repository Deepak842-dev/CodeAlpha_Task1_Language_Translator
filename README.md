# Language Translator

A browser-based language translator built with plain HTML, CSS, and JavaScript.

## Features

- Text input box with a 500-character limit and live character count
- Source and target language dropdowns (24 languages) with a one-click swap button
- Sends text to the MyMemory Translation API and displays the result
- Copy-to-clipboard button
- Text-to-speech playback of the translated text (uses the browser's built-in Web Speech API)
- Keyboard shortcut: Ctrl/Cmd + Enter to translate
- Error handling for empty input, network failures, and same-language selection
- Responsive layout (single column on small screens)

## Folder structure

```
language-translator/
├── index.html        # page structure and markup
├── css/
│   └── style.css      # all styling
├── js/
│   └── script.js       # language list, DOM logic, API calls
└── README.md
```

## How it works

1. The user types text into the source box and picks a "From" and "To" language.
2. On clicking **Translate**, `script.js` sends a GET request to the MyMemory
   Translation API: `https://api.mymemory.translated.net/get?q=<text>&langpair=<from>|<to>`
3. The API's JSON response is parsed and the translated text is shown in the result panel.
4. The **Copy** button copies the result to the clipboard; **Listen** reads it aloud.

## Why MyMemory instead of Google Translate / Microsoft Translator

Google Translate's and Microsoft Translator's APIs both require a paid
account, an API key, and (for security) a backend server to keep that key
hidden from the browser. MyMemory is a free, keyless, CORS-enabled API, so
this project can run entirely client-side with no setup — good for a demo
or coursework submission.

**If your assignment specifically requires Google Translate or Microsoft
Translator:** the API call is isolated in the `translate()` function in
`js/script.js`. Replace the `fetch` URL and response parsing with the
Google/Microsoft equivalent, and add a small backend (e.g. Node/Express)
to hold the API key — never put a paid API key directly in client-side JS.

## Running it

No build step or server required. Just open `index.html` in a browser.
(A local server, e.g. `python3 -m http.server`, is only needed if your
browser blocks fetch requests from `file://` pages — most don't for this API.)
