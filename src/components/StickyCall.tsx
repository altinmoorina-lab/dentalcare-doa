import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CLINIC } from "../clinic";
import { useI18n } from "../i18n";
import { useLayout } from "../lib/layout";
import { colors, fonts, gradient, radius } from "../theme";
import { useContact } from "./ContactSheet";
import { PressableScale } from "./ui";

const NATIVE = Platform.OS !== "web";

export function StickyCall() {
  const { s } = useI18n();
  const { isPhone } = useLayout();
  const insets = useSafeAreaInsets();
  const contact = useContact();
  const enter = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, delay: 900, useNativeDriver: NATIVE, speed: 8, bounciness: 9 }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(ring, { toValue: 1, duration: 1900, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }),
        Animated.delay(900),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enter, ring]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        isPhone ? { left: 16, right: 16, bottom: Math.max(insets.bottom, 10) + 8 } : { right: 28, bottom: 28 },
        { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }] },
      ]}
    >
      <PressableScale onPress={contact.open} accessibilityLabel={`${s.sheet.stickyCta} ${CLINIC.phoneDisplay}`} style={{ borderRadius: radius.pill }}>
        <View testID="sticky-call">
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              styles.ring,
              {
                opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                transform: [{ scaleX: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }, { scaleY: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.55] }) }],
              },
            ]}
          />
          <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.pill}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={19} color={colors.tealDark} />
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.cta}>{s.sheet.stickyCta}</Text>
              <Text style={styles.num}>{CLINIC.phoneDisplay}</Text>
            </View>
            <Ionicons name="chevron-up" size={18} color="rgba(255,255,255,0.85)" style={{ marginLeft: "auto" }} />
          </LinearGradient>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", zIndex: 400 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 20,
    borderRadius: radius.pill,
    minWidth: 230,
    boxShadow: "0 14px 34px rgba(8, 84, 100, 0.45)",
  },
  ring: { borderRadius: radius.pill, backgroundColor: colors.teal },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  cta: { fontFamily: fonts.bold, fontSize: 15.5, color: colors.white, lineHeight: 19 },
  num: { fontFamily: fonts.medium, fontSize: 12.5, color: "rgba(255,255,255,0.88)", lineHeight: 16 },
});
