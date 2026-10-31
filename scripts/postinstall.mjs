import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

if (process.env.VERCEL) {
  console.log("[postinstall] Building on Vercel: skipping the reviews API install (server/).");
  process.exit(0);
}

const res = spawnSync(npm, ["install", "--no-audit", "--no-fund"], {
  cwd: path.join(root, "server"),
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (res.status !== 0) {
  console.warn(
    "\n[postinstall] Could not install the reviews API dependencies (server/).\n" +
      "The app itself is installed and works without it (sample reviews, offline notice).\n" +
      "To retry later: cd server && npm install\n",
  );
}
process.exit(0);
