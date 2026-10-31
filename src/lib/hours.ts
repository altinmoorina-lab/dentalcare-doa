import type { DayHours } from "../clinic";

export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function lastSundayUtc(year: number, month: number): number {
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  return Date.UTC(year, month, lastDay.getUTCDate() - lastDay.getUTCDay(), 1, 0, 0);
}

/** Prishtina follows CET/CEST; DST runs 01:00 UTC on the last Sunday of March until the last Sunday of October. */
export function kosovoOffsetMinutes(date: Date): number {
  const y = date.getUTCFullYear();
  const t = date.getTime();
  const dst = t >= lastSundayUtc(y, 2) && t < lastSundayUtc(y, 9);
  return dst ? 120 : 60;
}

export type LocalTime = { dayIndex: number; minutes: number };

/** dayIndex: Monday = 0 … Sunday = 6, in Kosovo local time regardless of the device timezone. */
export function kosovoLocalTime(date: Date): LocalTime {
  const shifted = new Date(date.getTime() + kosovoOffsetMinutes(date) * 60_000);
  const jsDay = shifted.getUTCDay();
  return {
    dayIndex: (jsDay + 6) % 7,
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
  };
}

export type OpenStatus =
  | { state: "open"; closesAt: string; minutesLeft: number }
  | { state: "opensToday"; opensAt: string }
  | { state: "closed"; nextDayIndex: number | null; opensAt: string | null };

export function getOpenStatus(hours: DayHours[], date: Date): OpenStatus {
  const { dayIndex, minutes } = kosovoLocalTime(date);
  const today = hours[dayIndex];
  if (today) {
    const open = parseMinutes(today.open);
    const close = parseMinutes(today.close);
    if (minutes >= open && minutes < close) {
      return { state: "open", closesAt: today.close, minutesLeft: close - minutes };
    }
    if (minutes < open) return { state: "opensToday", opensAt: today.open };
  }
  for (let i = 1; i <= 7; i++) {
    const idx = (dayIndex + i) % 7;
    const h = hours[idx];
    if (h) return { state: "closed", nextDayIndex: idx, opensAt: h.open };
  }
  return { state: "closed", nextDayIndex: null, opensAt: null };
}
