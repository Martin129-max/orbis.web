# Orbis Web
The Web of Orbis.

## Instructions
1. Copy `example.env` to `.env.local` and set `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000`).
2. Start the [server](../server) on port `4000`.
3. Run the development server:

```bash
pnpm install
pnpm run develop
```

## Deploying on Vercel
Set `NEXT_PUBLIC_API_URL` to the deployed server URL in the Vercel project's Environment Variables before building.
