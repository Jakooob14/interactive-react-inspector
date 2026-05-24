import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/unplugin/index.ts',
    vite: 'src/unplugin/index.ts',
    loader: 'src/loader.ts',
    runtime: 'src/runtime/install.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom'],
  minify: true,
  sourcemap: true,
});
