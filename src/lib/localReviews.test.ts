import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addLocalReview, loadLocalReviews } from "./localReviews";

describe("local (browser) reviews", () => {
  it("merges submitted reviews with the samples, newest first", () => {
    const before = loadLocalReviews().stats.count;
    addLocalReview({ name: "Lura", rating: 5, comment: "Shumë mirë!" });
    const data = loadLocalReviews();
    assert.equal(data.reviews[0].name, "Lura");
    assert.equal(data.reviews[0].demo, false);
    assert.equal(data.stats.count, before + 1);
  });

  it("blocks duplicates and caps submissions per day", () => {
    assert.throws(() => addLocalReview({ name: "Lura", rating: 5, comment: "Shumë mirë!" }));
    addLocalReview({ name: "A", rating: 4, comment: "Komenti dy" });
    addLocalReview({ name: "B", rating: 4, comment: "Komenti tre" });
    assert.throws(() => addLocalReview({ name: "C", rating: 4, comment: "Komenti katër" }));
  });
});
