import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLINIC } from "../clinic";
import { getOpenStatus, kosovoLocalTime } from "./hours";

const at = (iso: string) => new Date(iso);

describe("opening hours", () => {
  it("is open on a weekday at noon (winter, UTC+1)", () => {
    const s = getOpenStatus(CLINIC.hours, at("2026-01-14T11:00:00Z"));
    assert.equal(s.state, "open");
  });

  it("uses summer time (UTC+2) for Kosovo", () => {
    const t = kosovoLocalTime(at("2026-07-15T16:30:00Z"));
    assert.deepEqual(t, { dayIndex: 2, minutes: 18 * 60 + 30 });
  });

  it("is closed on Sunday and reports next opening on Monday", () => {
    const s = getOpenStatus(CLINIC.hours, at("2026-10-11T10:00:00Z"));
    assert.equal(s.state, "closed");
    assert.equal(s.state === "closed" ? s.nextDayIndex : -1, 0);
  });

  it("closes Saturday at 14:00 local", () => {
    assert.equal(getOpenStatus(CLINIC.hours, at("2026-10-10T11:59:00Z")).state, "open");
    assert.equal(getOpenStatus(CLINIC.hours, at("2026-10-10T12:00:00Z")).state, "closed");
  });

  it("reports opensToday before opening", () => {
    const s = getOpenStatus(CLINIC.hours, at("2026-10-08T06:00:00Z"));
    assert.equal(s.state, "opensToday");
  });
});
