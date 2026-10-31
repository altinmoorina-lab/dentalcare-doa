import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { CLINIC } from "../clinic";
import { useI18n } from "../i18n";
import { pick, useLayout } from "../lib/layout";
import { colors, fonts, radius, shadow } from "../theme";
import { OpenBadge, useOpenLabel } from "./OpenBadge";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SectionHeader, T } from "./ui";

export function Hours() {
  const { s } = useI18n();
  const { isWide, bp } = useLayout();
  const { todayIndex } = useOpenLabel();

  return (
    <Section id="hours" bg={colors.bg}>
      <View style={{ flexDirection: isWide ? "row" : "column", gap: pick(bp, { phone: 28, tablet: 40, desktop: 72 }), alignItems: isWide ? "center" : "stretch" }}>
        <View style={{ flex: isWide ? 1 : undefined, gap: 20 }}>
          <Reveal>
            <SectionHeader eyebrow={s.hours.eyebrow} title={s.hours.title} />
          </Reveal>
          <Reveal delay={80}>
            <OpenBadge />
          </Reveal>
          <Reveal delay={140}>
            <T variant="small">{s.hours.note}</T>
          </Reveal>
        </View>

        <Reveal delay={100} style={{ flex: isWide ? 1.2 : undefined }}>
          <View style={styles.table} testID="hours-table">
            {CLINIC.hours.map((h, i) => {
              const isToday = i === todayIndex;
              return (
                <View key={i} style={[styles.row, i > 0 && styles.rowBorder, isToday && styles.rowToday]} testID={isToday ? "hours-today" : undefined}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                    <Text style={[styles.day, isToday && { color: colors.tealDark, fontFamily: fonts.bold }]}>{s.hours.days[i]}</Text>
                    {isToday ? (
                      <View style={styles.todayChip}>
                        <Text style={styles.todayText}>{s.hours.today}</Text>
                      </View>
                    ) : null}
                  </View>
                  {h ? (
                    <Text style={[styles.time, isToday && { color: colors.tealDark }]}>
                      {h.open} – {h.close}
                    </Text>
                  ) : (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="moon-outline" size={15} color={colors.muted} />
                      <Text style={[styles.time, { color: colors.muted }]}>{s.hours.closed}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </Reveal>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  table: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: "hidden", ...shadow.card },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  rowToday: { backgroundColor: colors.tealSoft },
  day: { fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  time: { fontFamily: fonts.semibold, fontSize: 16, color: colors.inkSoft, fontVariant: ["tabular-nums"] },
  todayChip: { backgroundColor: colors.tealDark, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 3 },
  todayText: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, textTransform: "uppercase", color: colors.white },
});
