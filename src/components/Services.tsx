import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useI18n } from "../i18n";
import { pick, useLayout } from "../lib/layout";
import { colors, fonts, gradient, radius, shadow } from "../theme";
import { useContact } from "./ContactSheet";
import { img } from "./images";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { PressableScale, SectionHeader, T } from "./ui";

type IconName = ComponentProps<typeof Ionicons>["name"];

export function Services() {
  const { s } = useI18n();
  const { bp, contentWidth } = useLayout();
  const cols = pick(bp, { phone: 1, tablet: 2, desktop: 4 });
  const gap = pick(bp, { phone: 16, tablet: 20, desktop: 22 });
  const cardW = (contentWidth - gap * (cols - 1)) / cols;

  const items: { key: string; icon: IconName; image: number; title: string; text: string }[] = [
    { key: "prosthetics", icon: "construct", image: img.xray, title: s.services.prosthetics.title, text: s.services.prosthetics.text },
    { key: "whitening", icon: "sparkles", image: img.smile, title: s.services.whitening.title, text: s.services.whitening.text },
    { key: "smile", icon: "happy", image: img.igVeneers, title: s.services.smile.title, text: s.services.smile.text },
    { key: "general", icon: "shield-checkmark", image: img.maskMirror, title: s.services.general.title, text: s.services.general.text },
  ];

  return (
    <Section id="services" bg={colors.bg}>
      <Reveal>
        <SectionHeader eyebrow={s.services.eyebrow} title={s.services.title} subtitle={s.services.subtitle} />
      </Reveal>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap, marginTop: 36 }}>
        {items.map((it, i) => (
          <Reveal key={it.key} delay={(i % cols) * 100} style={{ width: cardW }}>
            <ServiceCard icon={it.icon} image={it.image} title={it.title} text={it.text} width={cardW} />
          </Reveal>
        ))}
      </View>
    </Section>
  );
}

function ServiceCard({ icon, image, title, text, width }: { icon: IconName; image: number; title: string; text: string; width: number }) {
  const { s } = useI18n();
  const contact = useContact();
  return (
    <PressableScale onPress={contact.open} hoverScale={1.02} pressScale={0.98} style={[styles.card, { width }]} accessibilityLabel={`${title}. ${s.services.ask}`}>
      <View style={styles.imgBox}>
        <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} accessibilityLabel="" />
        <LinearGradient colors={["transparent", "rgba(6,34,48,0.35)"]} style={StyleSheet.absoluteFill} />
      </View>
      <LinearGradient colors={gradient.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.icon}>
        <Ionicons name={icon} size={22} color={colors.white} />
      </LinearGradient>
      <View style={styles.body}>
        <T variant="h3">{title}</T>
        <T variant="small" style={{ fontSize: 14.5, lineHeight: 22 }}>
          {text}
        </T>
        <View style={styles.askRow}>
          <Text style={styles.ask}>{s.services.ask}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.tealDark} />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: "hidden", borderWidth: 1, borderColor: colors.line, ...shadow.card },
  imgBox: { height: 170, backgroundColor: colors.tealSoft },
  icon: { position: "absolute", top: 146, left: 20, width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.white },
  body: { padding: 20, paddingTop: 34, gap: 8 },
  askRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  ask: { fontFamily: fonts.bold, fontSize: 14.5, color: colors.tealDark },
});
