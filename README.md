# ClearCut

Local-first image background remover with crop and resize tools.

## Run with Docker

```bash
docker compose up --build
```

Open http://localhost:20800. The first processor start downloads the `u2net` model into the persistent Docker volume cache.

## Run locally

```bash
npm install
npm run dev
```

The web app runs at http://localhost:5173 and the API at http://localhost:3001. The AI processor still needs to be running separately for local development.
