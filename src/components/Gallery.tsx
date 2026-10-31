import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { CLINIC } from "../clinic";
import { useI18n } from "../i18n";
import { pick, useLayout } from "../lib/layout";
import { openUrl } from "../lib/openUrl";
import { colors, fonts, radius, shadow } from "../theme";
import { img } from "./images";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { Button, PressableScale, SectionHeader } from "./ui";

const tiles: { src: number; ratio: number; ig?: boolean }[] = [
  { src: img.igVeneers, ratio: 1.15, ig: true },
  { src: img.treatment, ratio: 0.8 },
  { src: img.igSmile, ratio: 1.15, ig: true },
  { src: img.clinicBright, ratio: 1.3 },
  { src: img.igWork, ratio: 1.15, ig: true },
  { src: img.scan, ratio: 1 },
  { src: img.exam, ratio: 1.2 },
  { src: img.aligner, ratio: 1.0 },
];

export function Gallery() {
  const { s } = useI18n();
  const { bp, contentWidth } = useLayout();
  const [active, setActive] = useState<number | null>(null);
  const cols = pick(bp, { phone: 2, tablet: 3, desktop: 4 });
  const gap = pick(bp, { phone: 10, tablet: 14, desktop: 16 });
  const colW = (contentWidth - gap * (cols - 1)) / cols;

  const columns: { src: number; ratio: number; ig?: boolean; index: number }[][] = Array.from({ length: cols }, () => []);
  const heights = Array(cols).fill(0) as number[];
  tiles.forEach((t, index) => {
    const c = heights.indexOf(Math.min(...heights));
    columns[c].push({ ...t, index });
    heights[c] += 1 / t.ratio;
  });

  return (
    <Section id="gallery" bg={colors.white}>
      <Reveal>
        <SectionHeader eyebrow={s.gallery.eyebrow} title={s.gallery.title} subtitle={s.gallery.subtitle} />
      </Reveal>
      <View style={{ flexDirection: "row", gap, marginTop: 32, alignItems: "flex-start" }}>
        {columns.map((col, ci) => (
          <View key={ci} style={{ width: colW, gap }}>
            {col.map((t, ti) => (
              <Reveal key={t.index} delay={ci * 80 + ti * 40}>
                <PressableScale onPress={() => setActive(t.index)} hoverScale={1.025} pressScale={0.97} style={styles.tile} accessibilityLabel={`${s.gallery.eyebrow} ${t.index + 1}`}>
                  <View style={{ width: colW, height: colW / t.ratio }}>
                    <Image source={t.src} style={StyleSheet.absoluteFill} contentFit="cover" transition={400} accessibilityLabel="" />
                    {t.ig ? (
                      <View style={styles.igTag}>
                        <Ionicons name="logo-instagram" size={13} color={colors.white} />
                        <Text style={styles.igText}>@{CLINIC.instagram}</Text>
                      </View>
                    ) : null}
                  </View>
                </PressableScale>
              </Reveal>
            ))}
          </View>
        ))}
      </View>
      <Reveal style={{ marginTop: 32 }}>
        <Button label={s.gallery.instagram} icon="logo-instagram" variant="outline" onPress={() => openUrl(CLINIC.instagramUrl)} />
      </Reveal>

      <Modal visible={active !== null} transparent animationType="fade" onRequestClose={() => setActive(null)} statusBarTranslucent>
        <Pressable style={styles.lightbox} onPress={() => setActive(null)} accessibilityLabel={s.gallery.close}>
          {active !== null ? (
            <Image source={tiles[active].src} style={styles.lightImg} contentFit="contain" accessibilityLabel="" />
          ) : null}
          <View style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.white} />
          </View>
        </Pressable>
      </Modal>
    </Section>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.md + 4, overflow: "hidden", backgroundColor: colors.tealSoft, ...shadow.soft },
  igTag: {
    position: "absolute",
    left: 8,
    bottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: "rgba(10,27,38,0.62)",
  },
  igText: { fontFamily: fonts.semibold, fontSize: 11, color: colors.white },
  lightbox: { flex: 1, backgroundColor: "rgba(4,16,24,0.92)", alignItems: "center", justifyContent: "center", padding: 16 },
  lightImg: { width: "100%", height: "86%", maxWidth: 1000 },
  closeBtn: {
    position: "absolute",
    top: Platform.OS === "web" ? 24 : 56,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
});
