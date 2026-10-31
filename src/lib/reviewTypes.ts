export type Review = {
  id: number | string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  demo: boolean;
};

export type ReviewStats = { count: number; average: number };

export class ApiError extends Error {
  constructor(
    public kind: "network" | "validation" | "duplicate" | "rate" | "server",
    public fields?: Record<string, string>,
  ) {
    super(kind);
  }
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

export const OFFLINE_SAMPLE_REVIEWS: Review[] = [
  { id: "s1", name: "Arta K.", rating: 5, comment: "Staff i qetë dhe profesional. U ndjeva rehat gjatë gjithë vizitës.", createdAt: daysAgo(2), demo: true },
  { id: "s2", name: "Besnik M.", rating: 5, comment: "Shpjegim i qartë i trajtimit dhe asnjë ngutje. Rekomandoj.", createdAt: daysAgo(6), demo: true },
  { id: "s3", name: "Elira S.", rating: 4, comment: "Ambient shumë i pastër dhe termin i organizuar mirë.", createdAt: daysAgo(11), demo: true },
  { id: "s4", name: "Visitor", rating: 5, comment: "Very friendly team, clear explanations in English too.", createdAt: daysAgo(19), demo: true },
];
