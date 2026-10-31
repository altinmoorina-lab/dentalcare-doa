// Vercel (and some other static hosts) silently drop folders named "node_modules" from a
// deployment, which would lose the icon/font files Expo puts in dist/assets/node_modules.
// Rename the folder and rewrite the references so the deployed site keeps its fonts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const from = path.join(dist, "assets", "node_modules");
const to = path.join(dist, "assets", "vendor");

if (fs.existsSync(from)) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.renameSync(from, to);

  const rewrite = (file) => {
    const text = fs.readFileSync(file, "utf8");
    if (text.includes("assets/node_modules/")) {
      fs.writeFileSync(file, text.replaceAll("assets/node_modules/", "assets/vendor/"));
    }
  };
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|html|json|css)$/.test(entry.name)) rewrite(full);
    }
  };
  walk(dist);
  console.log("[postbuild-web] moved assets/node_modules -> assets/vendor");
}
