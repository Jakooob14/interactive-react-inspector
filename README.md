# interactive-react-inspector

React component inspector and source code jump utility. Quickly jump from your browser to your IDE by clicking on React components.

Inspired by [webfansplz/vite-plugin-vue-inspector](https://github.com/webfansplz/vite-plugin-vue-inspector).

## Features
- Inspect React components directly in the browser.
- Click to jump to the exact source code line in your editor.
- Cross-framework support for Vite and Next.js.

## Installation

```bash
npm install interactive-react-inspector
```

## Usage

### Vite

Add the plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite'
import Inspector from 'interactive-react-inspector'

export default defineConfig({
  plugins: [
    Inspector.vite(),
  ],
})
```

### Next.js

Add the Next.js integration to your `next.config.ts`:

```ts
import Inspector from 'interactive-react-inspector'

const nextConfig = {}

export default Inspector.next(nextConfig)
```

This configures Turbopack rules for `next dev --turbopack` and `next build --turbopack`, while keeping Webpack support for projects that still run `next dev --webpack`.

The inspector instruments development builds only. Production Next.js builds are supported and complete without inspector metadata being added.

You can try the Turbopack playground in this repository:

```bash
pnpm --dir playgrounds/next-turbopack dev
pnpm --dir playgrounds/next-turbopack build
```

## License
MIT
