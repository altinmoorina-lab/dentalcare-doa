export type ReviewInput = { name: string; rating: number; comment: string };

export type ValidationResult =
  | { ok: true; value: ReviewInput }
  | { ok: false; errors: Record<string, string> };

const URL_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|ru|xyz|info|biz|click|top)\b)/i;

function clean(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e]/g, "")
    .replace(/[<>]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateReview(body: unknown): ValidationResult {
  const raw = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const name = clean(raw.name).replace(/\s*\n\s*/g, " ");
  const comment = clean(raw.comment);
  const rating = typeof raw.rating === "number" ? raw.rating : Number(raw.rating);
  const errors: Record<string, string> = {};

  if (name.length < 2 || name.length > 60) errors.name = "name_length";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = "rating_range";
  if (comment.length < 5 || comment.length > 600) errors.comment = "comment_length";
  else if (URL_PATTERN.test(comment) || URL_PATTERN.test(name)) errors.comment = "no_links";
  else if (/(.)\1{9,}/.test(comment)) errors.comment = "repeated_chars";

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, rating, comment } };
}
