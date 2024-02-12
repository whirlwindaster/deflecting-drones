# Deflecting Drones

A web-based implementation of the board game
[`Ricochet Robots`](https://en.wikipedia.org/wiki/Ricochet_Robots)
built with Svelte and Sveltekit and deployed on Deno Deploy at [`https://dd.whirlwinda.st`](https://dd.whirlwinda.st)

## Local Development

Once you've installed dependencies with `npm install` (or
`pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To build a production version of the app:

```bash
npm run build
```

You can preview the production build with `deno run --allow-env --allow-read --allow-net build/mod.ts`.
