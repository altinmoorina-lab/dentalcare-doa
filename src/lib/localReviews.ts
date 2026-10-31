import { ApiError, OFFLINE_SAMPLE_REVIEWS, type Review, type ReviewStats } from "./reviewTypes";

/**
 * Browser-only review storage used when no reviews API is reachable (for example the
 * static web build on Vercel). Reviews live in this browser's localStorage only, so
 * they are NOT shared between visitors. Shared, persistent reviews need a hosted
 * database (see README, "Shared reviews").
 */
const KEY = "doa.reviews.v1";
const DAILY_CAP = 3;

let memory: Review[] = [];

function readOwn(): Review[] {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return memory;
    const parsed = JSON.parse(raw) as Review[];
    return Array.isArray(parsed) ? parsed.filter((r) => r && typeof r.comment === "string") : [];
  } catch {
    return memory;
  }
}

function writeOwn(list: Review[]) {
  memory = list;
  try {
    if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked (private mode): keep in memory for this session */
  }
}

export function statsOf(list: Review[]): ReviewStats {
  if (list.length === 0) return { count: 0, average: 0 };
  const avg = list.reduce((a, r) => a + r.rating, 0) / list.length;
  return { count: list.length, average: Math.round(avg * 10) / 10 };
}

export function loadLocalReviews(): { reviews: Review[]; stats: ReviewStats } {
  const reviews = [...readOwn(), ...OFFLINE_SAMPLE_REVIEWS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  return { reviews, stats: statsOf(reviews) };
}

export function addLocalReview(input: { name: string; rating: number; comment: string }): {
  review: Review;
  stats: ReviewStats;
} {
  const own = readOwn();
  const dayAgo = Date.now() - 86_400_000;
  const recent = own.filter((r) => new Date(r.createdAt).getTime() > dayAgo);
  if (recent.some((r) => r.comment === input.comment)) throw new ApiError("duplicate");
  if (recent.length >= DAILY_CAP) throw new ApiError("rate");

  const review: Review = {
    id: `local-${Date.now()}`,
    name: input.name,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
    demo: false,
  };
  writeOwn([review, ...own].slice(0, 50));
  return { review, stats: loadLocalReviews().stats };
}
