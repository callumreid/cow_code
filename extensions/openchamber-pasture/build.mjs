import { build } from "esbuild"
import path from "node:path"
import { readFile, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const root = path.dirname(fileURLToPath(import.meta.url))
const app = path.resolve(root, "../../packages/app/src")
await build({
  entryPoints: [path.join(root, "src/main.ts")],
  outfile: path.join(root, "panel/main.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2022",
  tsconfigRaw: {},
  minify: true,
  nodePaths: [path.join(root, "node_modules")],
  plugins: [{
    name: "cowcode-app-alias",
    setup(build) {
      build.onResolve({ filter: /^@\// }, (args) => ({ path: `${path.join(app, args.path.slice(2))}.ts` }))
    },
  }],
})

// GLSL embedded by three.js contains trailing whitespace; keep generated diffs clean.
const bundle = path.join(root, "panel/main.js")
await writeFile(bundle, (await readFile(bundle, "utf8")).replace(/[ \t]+$/gm, ""))
