import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { CLINIC } from "../clinic";
import { useI18n } from "../i18n";
import { pick, useLayout } from "../lib/layout";
import { openUrl } from "../lib/openUrl";
import { colors, fonts, radius, shadow } from "../theme";
import { img } from "./images";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { PressableScale, SectionHeader, T } from "./ui";

export function About() {
  const { s } = useI18n();
  const { isWide, bp, contentWidth } = useLayout();
  const twoCol = isWide;
  const imgW = twoCol ? Math.min(contentWidth * 0.46, 520) : contentWidth;
  const imgH = twoCol ? imgW * 1.12 : Math.min(contentWidth * 0.95, 440);

  return (
    <Section id="about" bg={colors.white} padTop={pick(bp, { phone: 96, tablet: 120, desktop: 150 })}>
      <View style={{ flexDirection: twoCol ? "row" : "column", gap: pick(bp, { phone: 32, tablet: 44, desktop: 72 }), alignItems: twoCol ? "center" : "stretch" }}>
        <Reveal from={twoCol ? "left" : "bottom"} style={{ width: imgW }}>
          <View style={{ width: imgW, height: imgH }}>
            <View style={[styles.imgWrap, { width: imgW, height: imgH }]}>
              <Image source={img.consult} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} accessibilityLabel="" />
            </View>
            <View style={[styles.floating, { right: twoCol ? -18 : 12, bottom: -22 }]}>
              <Logo size={46} />
              <View>
                <Text style={styles.floatName}>{CLINIC.doctor}</Text>
                <Text style={styles.floatRole}>{s.about.doctorRole}</Text>
              </View>
            </View>
          </View>
        </Reveal>

        <View style={{ flex: twoCol ? 1 : undefined, gap: 22, marginTop: twoCol ? 0 : 14 }}>
          <Reveal>
            <SectionHeader eyebrow={s.about.eyebrow} title={s.about.title} />
          </Reveal>
          <Reveal delay={80}>
            <T>{s.about.p1}</T>
          </Reveal>
          <Reveal delay={140}>
            <T>{s.about.p2}</T>
          </Reveal>
          <Reveal delay={200}>
            <View style={{ gap: 10 }}>
              <Fact icon="ribbon" label={s.about.factSpecialty} value={s.about.factSpecialtyValue} />
              <Fact icon="location" label={s.about.factLocation} value={s.about.factLocationValue} />
              <Fact icon="logo-instagram" label={s.about.factFollow} value={`@${CLINIC.instagram}`} onPress={() => openUrl(CLINIC.instagramUrl)} />
            </View>
          </Reveal>
        </View>
      </View>
    </Section>
  );
}

function Fact({ icon, label, value, onPress }: { icon: "ribbon" | "location" | "logo-instagram"; label: string; value: string; onPress?: () => void }) {
  const body = (
    <View style={styles.fact}>
      <View style={styles.factIcon}>
        <Ionicons name={icon} size={19} color={colors.tealDark} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.factLabel}>{label}</Text>
        <Text style={styles.factValue}>{value}</Text>
      </View>
      {onPress ? <Ionicons name="arrow-forward" size={18} color={colors.tealDark} /> : null}
    </View>
  );
  return onPress ? (
    <PressableScale onPress={onPress} accessibilityRole="link" accessibilityLabel={value}>
      {body}
    </PressableScale>
  ) : (
    body
  );
}

const styles = StyleSheet.create({
  imgWrap: { borderRadius: radius.xl, overflow: "hidden", backgroundColor: colors.tealSoft, ...shadow.lift },
  floating: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    padding: 10,
    paddingRight: 18,
    borderRadius: radius.pill,
    ...shadow.lift,
  },
  floatName: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.ink },
  floatRole: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.muted },
  fact: { flexDirection: "row", alignItems: "center", gap: 14, padding: 12, borderRadius: radius.md, backgroundColor: colors.bg },
  factIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
  factLabel: { fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: 0.8, textTransform: "uppercase", color: colors.muted },
  factValue: { fontFamily: fonts.bold, fontSize: 15.5, color: colors.ink, marginTop: 1 },
});
