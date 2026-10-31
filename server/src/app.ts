import crypto from "node:crypto";
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import type { ReviewRow, ReviewStore } from "./db.js";
import { validateReview } from "./validation.js";

export type AppOptions = {
  store: ReviewStore;
  allowedOrigins?: string[];
  ipSalt?: string;
  trustProxy?: boolean;
  postLimitPerHour?: number;
  perIpDailyCap?: number;
};

function serialize(r: ReviewRow) {
  return {
    id: r.id,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    demo: r.is_demo === 1,
  };
}

export function createApp(opts: AppOptions) {
  const {
    store,
    allowedOrigins = [],
    ipSalt = "dev-salt",
    trustProxy = false,
    postLimitPerHour = 10,
    perIpDailyCap = 3,
  } = opts;

  const app = express();
  app.disable("x-powered-by");
  if (trustProxy) app.set("trust proxy", 1);

  app.use(
    cors({
      origin: allowedOrigins.length === 0 ? true : allowedOrigins,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      maxAge: 86_400,
    }),
  );
  app.use(express.json({ limit: "8kb" }));

  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "rate_limited" },
    }),
  );

  const postLimiter = rateLimit({
    windowMs: 60 * 60_000,
    limit: postLimitPerHour,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "rate_limited" },
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/reviews", (req, res) => {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "20"), 10) || 20, 1), 50);
    const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);
    res.set("Cache-Control", "no-store");
    res.json({ reviews: store.list(limit, offset).map(serialize), stats: store.stats() });
  });

  app.post("/reviews", postLimiter, (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;

    // Honeypot: real users never see or fill this field.
    if (body && typeof body.website === "string" && body.website.trim() !== "") {
      res.status(201).json({ review: null, stats: store.stats() });
      return;
    }

    const result = validateReview(body);
    if (!result.ok) {
      res.status(422).json({ error: "validation_failed", fields: result.errors });
      return;
    }

    const ipHash = crypto
      .createHash("sha256")
      .update(`${ipSalt}:${req.ip ?? "unknown"}`)
      .digest("hex");
    const dayAgo = new Date(Date.now() - 86_400_000).toISOString();

    if (store.isDuplicate(ipHash, result.value.comment, dayAgo)) {
      res.status(409).json({ error: "duplicate" });
      return;
    }
    if (store.countFromIpSince(ipHash, dayAgo) >= perIpDailyCap) {
      res.status(429).json({ error: "daily_limit" });
      return;
    }

    const row = store.add({ ...result.value, ipHash });
    res.status(201).json({ review: serialize(row), stats: store.stats() });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found" });
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = typeof err === "object" && err && "status" in err ? Number((err as { status: number }).status) : 500;
    if (status >= 500) console.error(err);
    res.status(status >= 400 && status < 600 ? status : 500).json({ error: status === 400 ? "bad_request" : "server_error" });
  });

  return app;
}
