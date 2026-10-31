import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import { CLINIC } from "../clinic";
import { useI18n } from "../i18n";
import { getOpenStatus, kosovoLocalTime } from "../lib/hours";
import { colors, fonts, radius } from "../theme";

const NATIVE = Platform.OS !== "web";

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useOpenLabel() {
  const { s, fmt } = useI18n();
  const now = useNow();
  const status = getOpenStatus(CLINIC.hours, now);
  const todayIndex = kosovoLocalTime(now).dayIndex;
  const isOpen = status.state === "open";

  let detail = "";
  if (status.state === "open") {
    detail =
      status.minutesLeft <= 60
        ? fmt(s.hours.closesIn, { n: status.minutesLeft })
        : fmt(s.hours.closesAt, { t: status.closesAt });
  } else if (status.state === "opensToday") {
    detail = fmt(s.hours.opensToday, { t: status.opensAt });
  } else if (status.nextDayIndex !== null && status.opensAt) {
    detail =
      status.nextDayIndex === (todayIndex + 1) % 7
        ? fmt(s.hours.opensTomorrow, { t: status.opensAt })
        : fmt(s.hours.opensDay, { d: s.hours.days[status.nextDayIndex].toLowerCase(), t: status.opensAt });
  }
  return { isOpen, label: isOpen ? s.hours.openNow : s.hours.closedNow, detail, todayIndex };
}

export function OpenBadge({ tone = "light", showDetail = true }: { tone?: "light" | "glass"; showDetail?: boolean }) {
  const { isOpen, label, detail } = useOpenLabel();
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const dot = isOpen ? colors.green : colors.red;
  const glass = tone === "glass";
  return (
    <View
      testID="open-badge"
      style={[
        styles.badge,
        glass
          ? { backgroundColor: "rgba(255,255,255,0.16)", borderColor: "rgba(255,255,255,0.35)" }
          : { backgroundColor: isOpen ? colors.greenSoft : colors.redSoft, borderColor: "transparent" },
      ]}
    >
      <View style={styles.dotWrap}>
        <Animated.View
          style={[
            styles.ring,
            {
              backgroundColor: isOpen ? "#3DDC97" : colors.red,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
            },
          ]}
        />
        <View style={[styles.dot, { backgroundColor: glass && isOpen ? "#3DDC97" : dot }]} />
      </View>
      <Text style={[styles.label, { color: glass ? colors.white : isOpen ? "#0E7A4E" : "#A62E2E" }]}>
        {label}
        {showDetail && detail ? (
          <Text style={[styles.detail, { color: glass ? "rgba(255,255,255,0.8)" : colors.inkSoft }]}>{`  ·  ${detail}`}</Text>
        ) : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    alignSelf: "flex-start",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dotWrap: { width: 10, height: 10, alignItems: "center", justifyContent: "center" },
  dot: { width: 9, height: 9, borderRadius: 5 },
  ring: { position: "absolute", width: 9, height: 9, borderRadius: 5 },
  label: { fontFamily: fonts.bold, fontSize: 13.5 },
  detail: { fontFamily: fonts.medium, fontSize: 13 },
});
