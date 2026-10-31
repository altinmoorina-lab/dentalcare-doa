export const colors = {
  ink: "#0A1B26",
  inkSoft: "#3F5563",
  muted: "#6B8190",
  line: "#E1EDF0",
  bg: "#F3F9FA",
  white: "#FFFFFF",
  teal: "#0FA3A3",
  tealDark: "#0B7C86",
  tealSoft: "#DDF4F2",
  blue: "#0B5C8A",
  navy: "#0A2A3B",
  logoDark: "#211F20",
  gold: "#F5A524",
  green: "#1E9E68",
  greenSoft: "#E1F6EC",
  red: "#D64545",
  redSoft: "#FBE7E7",
  whatsapp: "#25D366",
};

export const fonts = {
  body: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extrabold: "PlusJakartaSans_800ExtraBold",
  display: "Fraunces_600SemiBold",
};

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };

export const shadow = {
  card: { boxShadow: "0 10px 26px rgba(10, 58, 75, 0.09)" },
  lift: { boxShadow: "0 18px 40px rgba(10, 58, 75, 0.18)" },
  soft: { boxShadow: "0 4px 14px rgba(10, 58, 75, 0.08)" },
} as const;

export const gradient = {
  brand: ["#0FA3A3", "#0B5C8A"] as const,
  dark: ["#0A2A3B", "#0B4F6C"] as const,
};
