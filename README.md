# STRAYED

A text-based narrative game about Ray, a jazz pianist on the edge of a record deal, and the stray cat that appears in the alley behind his gig one night.

Built with vanilla HTML, CSS, and JavaScript. No build step required.

## Play locally

Open `index.html` in any modern browser, or run:

```bash
npm start
```

The game will be served at `http://localhost:3000`.

## Deploy

The repository includes a tiny Node.js static server (`server.js`), `package.json`, and a `Procfile`, so it can be deployed on Build.io, Heroku, Railway, Render, or any platform that detects a Node.js app.

For pure static hosting (GitHub Pages, Netlify, Vercel, etc.), `index.html` is the entry point and no server is required.

## Save system

Progress is auto-saved to `localStorage` after every choice. When a player returns, they can continue their run or start a new game.

## How it works

- Each playthrough generates a random cat: one of five breeds, one of four social styles, and one of four core drives.
- Social style + core drive produces one of five personalities.
- A hidden trust meter is expressed only through the cat's behavior.
- Seven Act 2 choices pull your music career and the cat in opposite directions.
- One quiet night has no wrong answer — but shapes which ending you reach.
- Five possible endings.

## Structure

- `index.html` — game shell
- `style.css` — visual style
- `game.js` — state, scenes, cat generation, trust system, tone analysis
- `pixelart.js` — cozy 8-bit pixel art scene renderer (canvas, no external assets)

## License

MIT
