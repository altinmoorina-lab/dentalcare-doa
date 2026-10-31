import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createStore } from "./db.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 4871);
const dbPath = process.env.DB_PATH ?? path.join(here, "..", "data", "reviews.sqlite");
const store = await createStore(dbPath, { seedDemo: process.env.SEED_DEMO_REVIEWS !== "false" });

const app = createApp({
  store,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  ipSalt: process.env.IP_HASH_SALT,
  trustProxy: process.env.TRUST_PROXY === "true",
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`[reviews-api] listening on http://localhost:${port}  (db: ${dbPath})`);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) {
        console.log(`[reviews-api] LAN: http://${a.address}:${port}`);
      }
    }
  }
});

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    server.close(() => {
      store.close();
      process.exit(0);
    });
  });
}
