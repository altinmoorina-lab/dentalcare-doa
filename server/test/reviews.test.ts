import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.js";
import { createStore, type ReviewStore } from "../src/db.js";

describe("reviews api", () => {
  let store: ReviewStore;
  let server: Server;
  const base = () => `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const post = (body: unknown) =>
    fetch(`${base()}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  before(async () => {
    store = await createStore(":memory:", { seedDemo: true });
    const app = createApp({ store, postLimitPerHour: 50, perIpDailyCap: 3 });
    server = app.listen(0);
    await new Promise<void>((r) => server.once("listening", () => r()));
  });
  after(() => {
    server.close();
    store.close();
  });

  it("lists seeded reviews newest first with stats", async () => {
    const data = await (await fetch(`${base()}/reviews`)).json();
    assert.equal(data.reviews.length, 4);
    assert.equal(data.stats.count, 4);
    const times = data.reviews.map((r: { createdAt: string }) => r.createdAt);
    assert.deepEqual([...times].sort().reverse(), times);
  });

  it("creates a review and shows it first", async () => {
    const res = await post({ name: "Test User", rating: 5, comment: "Shumë mirë, faleminderit!" });
    assert.equal(res.status, 201);
    const data = await (await fetch(`${base()}/reviews`)).json();
    assert.equal(data.reviews[0].name, "Test User");
    assert.equal(data.reviews[0].demo, false);
    assert.equal(data.stats.count, 5);
  });

  it("rejects invalid input", async () => {
    assert.equal((await post({ name: "A", rating: 9, comment: "x" })).status, 422);
    assert.equal((await post({ name: "Valid", rating: 5, comment: "visit http://spam.xyz now" })).status, 422);
  });

  it("silently drops honeypot submissions", async () => {
    const before = store.stats().count;
    const res = await post({ name: "Bot", rating: 5, comment: "great great great", website: "x" });
    assert.equal(res.status, 201);
    assert.equal(store.stats().count, before);
  });

  it("persists to disk and reloads", async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "doa-"));
    const file = path.join(dir, "r.sqlite");
    const a = await createStore(file, { seedDemo: false });
    a.add({ name: "Persist", rating: 4, comment: "Stored on disk", ipHash: "x" });
    a.close();
    const b = await createStore(file, { seedDemo: true });
    assert.equal(b.stats().count, 1);
    assert.equal(b.list(5, 0)[0].name, "Persist");
    b.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it("blocks duplicates and enforces the per-IP daily cap", async () => {
    assert.equal((await post({ name: "Test User", rating: 5, comment: "Shumë mirë, faleminderit!" })).status, 409);
    assert.equal((await post({ name: "Second", rating: 4, comment: "Second comment here" })).status, 201);
    assert.equal((await post({ name: "Third", rating: 4, comment: "Third comment here" })).status, 201);
    assert.equal((await post({ name: "Fourth", rating: 4, comment: "Fourth comment here" })).status, 429);
  });
});
