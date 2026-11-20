import { build } from "esbuild"
await build({
  entryPoints: ["src/panel.js"],
  outfile: "panel/main.js",
  tsconfigRaw: {},
  bundle: true,
  minify: true,
  platform: "browser",
  format: "iife",
  target: "es2022",
})
await build({
  entryPoints: ["src/service.js"],
  outfile: "service/main.js",
  tsconfigRaw: {},
  bundle: true,
  minify: true,
  platform: "node",
  format: "esm",
  target: "node22",
  external: ["bufferutil", "utf-8-validate"],
  banner: { js: "import {createRequire} from 'node:module';const require=createRequire(import.meta.url);" },
})
