# react-inspector

React component inspector and source code jump utility.

## Features
- Inspect React components in the browser.
- Click to jump to the source code in your editor.
- Supports Vite and Next.js.

## Installation

```bash
npm install react-inspector
```

## Usage

### Vite

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import Inspector from 'react-inspector'

export default defineConfig({
  plugins: [
    Inspector.vite(),
  ],
})
```

```tsx
// main.tsx
import { installInspector } from 'react-inspector/runtime'

installInspector()
```

### Next.js

```ts
// next.config.ts
import Inspector from 'react-inspector'

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

## License
ISC
