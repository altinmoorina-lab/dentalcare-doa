import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { API_URL } from "../config";
import { fetchReviews, submitReview, type Review, type ReviewStats } from "./api";
import { addLocalReview, loadLocalReviews, statsOf } from "./localReviews";

/**
 * loading: first fetch in flight
 * ready:   reviews come from the API
 * local:   no API (static web deploy or API unreachable on web): reviews live in this browser only
 * offline: native app can't reach the API; read-only sample reviews
 */
type Status = "loading" | "ready" | "local" | "offline";

type ReviewsCtx = {
  reviews: Review[];
  stats: ReviewStats;
  status: Status;
  reload: () => Promise<void>;
  submit: (input: { name: string; rating: number; comment: string }) => Promise<void>;
  canRetry: boolean;
};

const Ctx = createContext<ReviewsCtx | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ count: 0, average: 0 });
  const [status, setStatus] = useState<Status>("loading");

  const applyLocal = useCallback(() => {
    const data = loadLocalReviews();
    setReviews(data.reviews);
    setStats(data.stats);
    setStatus("local");
  }, []);

  const reload = useCallback(async () => {
    if (!API_URL) {
      applyLocal();
      return;
    }
    setStatus((s) => (s === "ready" ? s : "loading"));
    try {
      const data = await fetchReviews();
      setReviews(data.reviews);
      setStats(data.stats);
      setStatus("ready");
    } catch {
      if (Platform.OS === "web") {
        applyLocal();
      } else {
        const data = loadLocalReviews();
        setReviews(data.reviews.filter((r) => r.demo));
        setStats(statsOf(data.reviews.filter((r) => r.demo)));
        setStatus("offline");
      }
    }
  }, [applyLocal]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submit = useCallback(
    async (input: { name: string; rating: number; comment: string }) => {
      if (status === "local") {
        const res = addLocalReview(input);
        setReviews((prev) => [res.review, ...prev]);
        setStats(res.stats);
        return;
      }
      const res = await submitReview(input);
      if (res.review) setReviews((prev) => [res.review as Review, ...prev]);
      setStats(res.stats);
    },
    [status],
  );

  const value = useMemo(
    () => ({ reviews, stats, status, reload, submit, canRetry: !!API_URL }),
    [reviews, stats, status, reload, submit],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useReviews(): ReviewsCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error("useReviews must be used inside ReviewsProvider");
  return v;
}
