// Kopieert de MapLibre-worker naar public/, zodat de kaart hem kan laden.
// Draait automatisch vóór "npm run dev" en "npm run build".
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const pkgDir = path.dirname(require.resolve("maplibre-gl/package.json"));
const source = path.join(pkgDir, "dist", "maplibre-gl-worker.mjs");
const targetDir = path.join(process.cwd(), "public", "maplibre");

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, path.join(targetDir, "maplibre-gl-worker.mjs"));
console.log("MapLibre-worker gekopieerd naar public/maplibre/");
