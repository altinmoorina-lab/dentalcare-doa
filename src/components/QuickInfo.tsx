import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { CLINIC, MAPS_URL } from "../clinic";
import { useI18n } from "../i18n";
import { useLayout } from "../lib/layout";
import { openUrl } from "../lib/openUrl";
import { colors, fonts, radius, shadow } from "../theme";
import { useContact } from "./ContactSheet";
import { OpenBadge, useOpenLabel } from "./OpenBadge";
import { Reveal } from "./Reveal";
import { Container, IconBadge, PressableScale } from "./ui";

export function QuickInfo() {
  const { s } = useI18n();
  const { isWide, isDesktop } = useLayout();
  const contact = useContact();
  const { todayIndex } = useOpenLabel();
  const today = CLINIC.hours[todayIndex];

  return (
    <View style={{ marginTop: isWide ? -52 : -38, zIndex: 5 }}>
      <Container style={{ flexDirection: isWide ? "row" : "column", gap: 14 }}>
        <Reveal style={{ flex: isWide ? 1 : undefined }}>
          <PressableScale onPress={contact.open} style={[styles.card, styles.primary]} accessibilityLabel={`${s.quick.call} ${CLINIC.phoneDisplay}`}>
            <IconBadge name="call" tint="rgba(255,255,255,0.18)" color={colors.white} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: "rgba(255,255,255,0.78)" }]}>{s.quick.call}</Text>
              <Text style={[styles.value, { color: colors.white }]} testID="quick-phone">
                {CLINIC.phoneDisplay}
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </PressableScale>
        </Reveal>

        <Reveal delay={90} style={{ flex: isWide ? 1 : undefined }}>
          <View style={[styles.card, { gap: 10, alignItems: "flex-start", flexDirection: "column" }]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <IconBadge name="time" />
              <View>
                <Text style={styles.label}>{s.quick.hours}</Text>
                <Text style={styles.value}>{today ? `${today.open} – ${today.close}` : s.hours.closed}</Text>
              </View>
            </View>
            <OpenBadge showDetail={!isDesktop || true} />
          </View>
        </Reveal>

        <Reveal delay={180} style={{ flex: isWide ? 1 : undefined }}>
          <PressableScale onPress={() => openUrl(MAPS_URL)} style={styles.card} accessibilityLabel={s.location.open} accessibilityRole="link">
            <IconBadge name="location" />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{s.quick.location}</Text>
              <Text style={styles.value} numberOfLines={2}>
                {CLINIC.addressLines[0]}, Prishtinë
              </Text>
            </View>
            <Ionicons name="open-outline" size={19} color={colors.tealDark} />
          </PressableScale>
        </Reveal>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    minHeight: 92,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.lift,
  },
  primary: { backgroundColor: colors.tealDark, borderColor: colors.tealDark },
  label: { fontFamily: fonts.semibold, fontSize: 12.5, letterSpacing: 0.4, color: colors.muted, textTransform: "uppercase" },
  value: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, marginTop: 2 },
});
