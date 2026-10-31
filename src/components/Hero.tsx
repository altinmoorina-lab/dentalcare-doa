import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { pick, useLayout } from "../lib/layout";
import { useReviews } from "../lib/reviews";
import { colors, fonts, radius } from "../theme";
import { useContact } from "./ContactSheet";
import { img } from "./images";
import { Logo } from "./Logo";
import { useNav } from "./NavContext";
import { OpenBadge } from "./OpenBadge";
import { Button, Container, Stars, T } from "./ui";

const NATIVE = Platform.OS !== "web";

export function Hero({ scrollY }: { scrollY: Animated.Value }) {
  const { s, fmt } = useI18n();
  const { bp, isDesktop, isPhone, height } = useLayout();
  const nav = useNav();
  const contact = useContact();
  const { stats, status } = useReviews();
  const enter = useRef(Array.from({ length: 5 }, () => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      110,
      enter.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE }),
      ),
    ).start();
  }, [enter]);

  const rise = (i: number) => ({
    opacity: enter[i],
    transform: [{ translateY: enter[i].interpolate({ inputRange: [0, 1], outputRange: [26, 0] }) }],
  });

  const heroHeight = pick(bp, {
    phone: Math.max(620, Math.min(height * 0.92, 760)),
    tablet: 700,
    desktop: Math.max(680, Math.min(height * 0.9, 780)),
  });

  const imgY = scrollY.interpolate({ inputRange: [-200, 0, 800], outputRange: [-60, 0, 240], extrapolate: "clamp" });
  const imgScale = scrollY.interpolate({ inputRange: [-300, 0], outputRange: [1.25, 1.12], extrapolate: "clamp" });

  return (
    <View style={{ height: heroHeight, backgroundColor: colors.navy, overflow: "hidden" }}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateY: imgY }, { scale: imgScale }] }]}>
        <Image source={img.heroChair} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition={isPhone ? { left: "62%", top: "50%" } : "center"} transition={500} accessibilityLabel="" />
      </Animated.View>
      <LinearGradient
        colors={isDesktop ? ["rgba(6,34,48,0.92)", "rgba(6,34,48,0.7)", "rgba(6,34,48,0.18)"] : ["rgba(6,34,48,0.5)", "rgba(6,34,48,0.55)", "rgba(6,34,48,0.94)"]}
        locations={isDesktop ? [0, 0.45, 1] : [0, 0.4, 1]}
        start={isDesktop ? { x: 0, y: 0.5 } : { x: 0.5, y: 0 }}
        end={isDesktop ? { x: 1, y: 0.5 } : { x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Container style={{ flex: 1, justifyContent: isPhone ? "flex-end" : "center", paddingTop: 90, paddingBottom: pick(bp, { phone: 74, tablet: 96, desktop: 90 }) }}>
        <View style={{ maxWidth: isDesktop ? 640 : 620, gap: isPhone ? 16 : 22 }}>
          <Animated.View style={[rise(0), { flexDirection: "row", flexWrap: "wrap", gap: 10 }]}>
            <OpenBadge tone="glass" showDetail={!isPhone} />
            {status !== "loading" && stats.count > 0 ? (
              <View style={styles.rating}>
                <Stars value={stats.average} size={13} gap={1} />
                <Text style={styles.ratingText}>
                  {stats.average.toFixed(1)} · {fmt(s.hero.ratingFrom, { n: stats.count })}
                </Text>
              </View>
            ) : null}
          </Animated.View>

          <Animated.View style={[rise(1), { gap: 12 }]}>
            <T variant="eyebrow" color="#8CE9E4">
              {s.hero.eyebrow}
            </T>
            <T variant="display" color={colors.white} style={isPhone ? { fontSize: 40, lineHeight: 43 } : undefined}>
              {s.hero.title}
            </T>
          </Animated.View>

          <Animated.View style={rise(2)}>
            <T color="rgba(255,255,255,0.86)" style={{ maxWidth: 540 }}>
              {s.hero.subtitle}
            </T>
          </Animated.View>

          <Animated.View style={[rise(3), { flexDirection: "row", flexWrap: "wrap", gap: 12 }]}>
            <Button label={s.hero.book} icon="calendar" size={isPhone ? "md" : "lg"} onPress={contact.open} />
            <Button label={s.hero.seeServices} variant="ghostLight" size={isPhone ? "md" : "lg"} onPress={() => nav.scrollTo("services")} />
          </Animated.View>

          <Animated.View style={[rise(4), styles.doctor]}>
            <Logo size={44} />
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.doctorName}>{`Dr. spec. Shkumbin Bajrami`}</Text>
              <Text style={styles.doctorRole}>{s.about.doctorRole}</Text>
            </View>
          </Animated.View>
        </View>
      </Container>

      {!isPhone ? <ScrollHint label={s.hero.scroll} /> : null}
    </View>
  );
}

function ScrollHint({ label }: { label: string }) {
  const bob = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE }),
        Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: NATIVE }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob]);
  return (
    <Animated.View style={[styles.scrollHint, { transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, 8] }) }] }]} pointerEvents="none">
      <Text style={styles.scrollText}>{label}</Text>
      <Ionicons name="chevron-down" size={18} color="rgba(255,255,255,0.8)" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  ratingText: { fontFamily: fonts.bold, fontSize: 13, color: colors.white },
  doctor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    alignSelf: "flex-start",
    padding: 8,
    paddingRight: 18,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    marginTop: 4,
  },
  doctorName: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.white },
  doctorRole: { fontFamily: fonts.medium, fontSize: 12.5, color: "rgba(255,255,255,0.78)" },
  scrollHint: { position: "absolute", bottom: 54, alignSelf: "center", alignItems: "center", opacity: 0.9 },
  scrollText: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", color: "rgba(255,255,255,0.7)" },
});
