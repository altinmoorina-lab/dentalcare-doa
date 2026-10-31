import { API_URL } from "../config";

export { ApiError, OFFLINE_SAMPLE_REVIEWS } from "./reviewTypes";
export type { Review, ReviewStats } from "./reviewTypes";
import { ApiError, type Review, type ReviewStats } from "./reviewTypes";

async function request<T>(path: string, init?: RequestInit): Promise<{ status: number; data: T }> {
  if (!API_URL) throw new ApiError("network");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    const data = (await res.json().catch(() => ({}))) as T;
    return { status: res.status, data };
  } catch {
    throw new ApiError("network");
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchReviews(): Promise<{ reviews: Review[]; stats: ReviewStats }> {
  const { status, data } = await request<{ reviews: Review[]; stats: ReviewStats }>("/reviews?limit=50");
  if (status !== 200 || !Array.isArray(data.reviews)) throw new ApiError("server");
  return data;
}

export async function submitReview(input: {
  name: string;
  rating: number;
  comment: string;
}): Promise<{ review: Review | null; stats: ReviewStats }> {
  const { status, data } = await request<{
    review: Review | null;
    stats: ReviewStats;
    error?: string;
    fields?: Record<string, string>;
  }>("/reviews", { method: "POST", body: JSON.stringify({ ...input, website: "" }) });

  if (status === 201) return data;
  if (status === 422) throw new ApiError("validation", data.fields);
  if (status === 409) throw new ApiError("duplicate");
  if (status === 429) throw new ApiError("rate");
  throw new ApiError("server");
}
