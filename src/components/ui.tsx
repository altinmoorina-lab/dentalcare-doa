import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, type ComponentProps, type ReactNode } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { pick, useLayout } from "../lib/layout";
import { colors, fonts, gradient, radius, shadow } from "../theme";

const NATIVE = Platform.OS !== "web";

type Variant = "display" | "h2" | "h3" | "body" | "small" | "eyebrow";

export function T({
  variant = "body",
  color,
  align,
  style,
  children,
  numberOfLines,
  selectable,
}: {
  variant?: Variant;
  color?: string;
  align?: TextStyle["textAlign"];
  style?: StyleProp<TextStyle>;
  children: ReactNode;
  numberOfLines?: number;
  selectable?: boolean;
}) {
  const { bp } = useLayout();
  const base: TextStyle = (() => {
    switch (variant) {
      case "display": {
        const size = pick(bp, { phone: 38, tablet: 52, desktop: 64 });
        return { fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.08, letterSpacing: -0.5, color: colors.ink };
      }
      case "h2": {
        const size = pick(bp, { phone: 29, tablet: 36, desktop: 42 });
        return { fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.15, letterSpacing: -0.3, color: colors.ink };
      }
      case "h3":
        return { fontFamily: fonts.bold, fontSize: pick(bp, { phone: 18, tablet: 19 }), lineHeight: 26, color: colors.ink };
      case "small":
        return { fontFamily: fonts.medium, fontSize: 14, lineHeight: 21, color: colors.inkSoft };
      case "eyebrow":
        return {
          fontFamily: fonts.bold,
          fontSize: 12.5,
          lineHeight: 18,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: colors.tealDark,
        };
      default:
        return { fontFamily: fonts.body, fontSize: pick(bp, { phone: 16, desktop: 17 }), lineHeight: pick(bp, { phone: 25, desktop: 27 }), color: colors.inkSoft };
    }
  })();
  return (
    <Text
      numberOfLines={numberOfLines}
      selectable={selectable}
      style={[base, color ? { color } : null, align ? { textAlign: align } : null, style]}
    >
      {children}
    </Text>
  );
}

export function Container({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { contentWidth } = useLayout();
  return <View style={[{ width: contentWidth, alignSelf: "center" }, style]}>{children}</View>;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
  light,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  light?: boolean;
}) {
  return (
    <View style={{ gap: 10, alignItems: align === "center" ? "center" : "flex-start", maxWidth: 680 }}>
      <T variant="eyebrow" color={light ? "#7FE3E0" : undefined}>
        {eyebrow}
      </T>
      <T variant="h2" align={align} color={light ? colors.white : undefined}>
        {title}
      </T>
      {subtitle ? (
        <T align={align} color={light ? "rgba(255,255,255,0.78)" : undefined}>
          {subtitle}
        </T>
      ) : null}
    </View>
  );
}

export function PressableScale({
  onPress,
  children,
  style,
  hoverScale = 1.015,
  pressScale = 0.965,
  accessibilityLabel,
  accessibilityRole = "button",
  disabled,
}: {
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  hoverScale?: number;
  pressScale?: number;
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "link";
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.spring(scale, { toValue: v, useNativeDriver: NATIVE, speed: 30, bounciness: 6 }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(pressScale)}
      onPressOut={() => to(1)}
      onHoverIn={() => to(hoverScale)}
      onHoverOut={() => to(1)}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={Platform.OS === "web" ? { cursor: disabled ? "default" : "pointer" } as ViewStyle : undefined}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
  variant?: "primary" | "light" | "outline" | "whatsapp" | "ghostLight";
  size?: "md" | "lg";
  full?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Button({ label, onPress, icon, variant = "primary", size = "md", full, disabled, accessibilityLabel }: ButtonProps) {
  const height = size === "lg" ? 56 : 48;
  const fg =
    variant === "light" ? colors.tealDark : variant === "outline" ? colors.tealDark : colors.white;
  const content = (
    <View style={[styles.btnInner, { height, paddingHorizontal: size === "lg" ? 26 : 20 }]}>
      {icon ? <Ionicons name={icon} size={size === "lg" ? 20 : 18} color={fg} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: size === "lg" ? 16.5 : 15, color: fg }}>{label}</Text>
    </View>
  );
  const common: ViewStyle = {
    borderRadius: radius.pill,
    overflow: "hidden",
    alignSelf: full ? "stretch" : "flex-start",
    opacity: disabled ? 0.6 : 1,
  };
  return (
    <PressableScale onPress={onPress} disabled={disabled} accessibilityLabel={accessibilityLabel ?? label} style={[common, full ? { alignSelf: "stretch" } : null]}>
      {variant === "primary" ? (
        <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[shadowPrimary, { borderRadius: radius.pill }]}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            { borderRadius: radius.pill },
            variant === "light" && { backgroundColor: colors.white },
            variant === "whatsapp" && { backgroundColor: colors.whatsapp },
            variant === "outline" && { borderWidth: 1.5, borderColor: colors.tealDark, backgroundColor: "transparent" },
            variant === "ghostLight" && { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
          ]}
        >
          {content}
        </View>
      )}
    </PressableScale>
  );
}

const shadowPrimary = { boxShadow: "0 10px 24px rgba(11, 124, 134, 0.35)" } as ViewStyle;

export function IconBadge({ name, size = 48, tint = colors.tealSoft, color = colors.tealDark }: { name: ComponentProps<typeof Ionicons>["name"]; size?: number; tint?: string; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2.6, backgroundColor: tint, alignItems: "center", justifyContent: "center" }}>
      <Ionicons name={name} size={size * 0.46} color={color} />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Stars({ value, size = 16, gap = 2 }: { value: number; size?: number; gap?: number }) {
  return (
    <View style={{ flexDirection: "row", gap }} accessibilityLabel={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={value >= i - 0.25 ? "star" : value >= i - 0.75 ? "star-half" : "star-outline"}
          size={size}
          color={colors.gold}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  btnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9 },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.card,
  } as ViewStyle,
});
