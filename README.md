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

> IMPORTANT]
> `interactive-react-inspector` currently requires **Webpack**. It is not compatible with Turbopack yet. Ensure you run your dev server with the `--webpack` flag or have it enabled in your config.

1. Add the plugin to your `next.config.ts`:

```ts
import Inspector from 'interactive-react-inspector'

const nextConfig = {
  webpack(config) {
    config.plugins.push(
      Inspector.webpack(),
    )
    return config
  },
}

export default nextConfig
```

2. Run Next.js with Webpack:

```bash
next dev --webpack
```

## License
MIT

