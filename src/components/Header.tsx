import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useI18n } from "../i18n";
import { useLayout } from "../lib/layout";
import { colors, fonts, radius } from "../theme";
import { useContact } from "./ContactSheet";
import { Logo } from "./Logo";
import { useNav, type SectionId } from "./NavContext";

const NATIVE = Platform.OS !== "web";
const links: Exclude<SectionId, "top">[] = ["about", "services", "reviews", "gallery", "hours", "contact"];

export function Header() {
  const { s, lang, toggle } = useI18n();
  const { isDesktop, isPhone, contentWidth } = useLayout();
  const insets = useSafeAreaInsets();
  const nav = useNav();
  const contact = useContact();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 700, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }).start();
  }, [enter]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          top: Math.max(insets.top, 10) + (Platform.OS === "web" ? 6 : 4),
          opacity: enter,
          transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
        },
      ]}
    >
      <View style={[styles.bar, { width: isPhone ? "92%" : Math.min(contentWidth + 24, 1184) }]}>
        <Pressable onPress={() => nav.scrollTo("top")} style={styles.brand} accessibilityRole="link" accessibilityLabel="DentalCare DOA">
          <Logo size={isPhone ? 38 : 42} />
          <View>
            <Text style={styles.brandName}>DentalCare DOA</Text>
            <Text style={styles.brandSub}>{s.brandSub}</Text>
          </View>
        </Pressable>

        {isDesktop ? (
          <View style={styles.links}>
            {links.map((id) => (
              <NavLink key={id} label={s.nav[id]} onPress={() => nav.scrollTo(id)} />
            ))}
          </View>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={styles.actions}>
          <Pressable onPress={toggle} style={styles.lang} accessibilityRole="button" accessibilityLabel={lang === "sq" ? "Switch to English" : "Kalo në shqip"} testID="lang-toggle">
            <Ionicons name="language" size={15} color={colors.tealDark} />
            <Text style={styles.langText}>{s.lang.switchTo}</Text>
          </Pressable>
          <Pressable onPress={contact.open} style={styles.callBtn} accessibilityRole="button" accessibilityLabel={s.sheet.stickyCta} testID="header-call">
            <Ionicons name="call" size={17} color={colors.white} />
            {!isPhone ? <Text style={styles.callText}>{s.sheet.stickyCta}</Text> : null}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

function NavLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={(state) => [styles.link, (state as { hovered?: boolean }).hovered ? { backgroundColor: colors.tealSoft } : null]}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 0, right: 0, alignItems: "center", zIndex: 500 },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingLeft: 8,
    paddingRight: 8,
    boxShadow: "0 8px 30px rgba(6, 25, 36, 0.16)",
    ...(Platform.OS === "web" ? ({ backdropFilter: "blur(14px)" } as object) : null),
  } as ViewStyle,
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandName: { fontFamily: fonts.display, fontSize: 17, color: colors.ink, lineHeight: 20 },
  brandSub: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", color: colors.muted },
  links: { flex: 1, flexDirection: "row", justifyContent: "center", gap: 2 },
  link: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: radius.pill },
  linkText: { fontFamily: fonts.semibold, fontSize: 14.5, color: colors.inkSoft },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  lang: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.tealSoft,
  },
  langText: { fontFamily: fonts.bold, fontSize: 13, color: colors.tealDark },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 38,
    height: 38,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.tealDark,
  },
  callText: { fontFamily: fonts.bold, fontSize: 14, color: colors.white, paddingRight: 4 },
});
