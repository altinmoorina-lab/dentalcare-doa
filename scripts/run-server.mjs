import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const script = process.argv[2] === "dev" ? "dev" : "start";

const child = spawn(npm, ["--prefix", "server", "run", script], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("error", (err) => {
  console.warn(`[api] Could not start the reviews API: ${err.message}`);
  process.exit(0);
});

child.on("exit", (code) => {
  if (code) {
    console.warn(
      `\n[api] The reviews API stopped (exit code ${code}). The app keeps running and will show sample reviews.\n` +
        "[api] Check the error above, fix it, then run `npm run server` in another terminal.\n",
    );
  }
  // Exit 0 so `npm run dev` keeps the Expo dev server alive.
  process.exit(0);
});

for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => child.kill(sig));
}
