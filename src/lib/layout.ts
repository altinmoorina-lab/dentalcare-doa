import { useWindowDimensions } from "react-native";

export type Breakpoint = "phone" | "tablet" | "desktop";

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const bp: Breakpoint = width >= 1024 ? "desktop" : width >= 700 ? "tablet" : "phone";
  const gutter = bp === "phone" ? 20 : bp === "tablet" ? 36 : 48;
  const contentWidth = Math.min(width - gutter * 2, 1160);
  return {
    width,
    height,
    bp,
    isPhone: bp === "phone",
    isDesktop: bp === "desktop",
    isWide: bp !== "phone",
    gutter,
    contentWidth,
  };
}

export function pick<T>(bp: Breakpoint, v: { phone: T; tablet?: T; desktop?: T }): T {
  if (bp === "desktop") return v.desktop ?? v.tablet ?? v.phone;
  if (bp === "tablet") return v.tablet ?? v.phone;
  return v.phone;
}
