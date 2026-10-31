import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { CLINIC, MAPS_URL } from "../clinic";
import { useI18n } from "../i18n";
import { pick, useLayout } from "../lib/layout";
import { mailUrl, openUrl } from "../lib/openUrl";
import { colors, fonts, radius, shadow } from "../theme";
import { PhoneLink } from "./PhoneLink";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { Button, IconBadge, PressableScale, SectionHeader, T } from "./ui";

function ContactRow({ icon, label, children }: { icon: "call" | "mail"; label: string; children: ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
      <IconBadge name={icon} size={44} />
      <View style={{ gap: 2 }}>
        <Text style={styles.contactLabel}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

const NATIVE = Platform.OS !== "web";
const ZOOM = 16;
const TILE = 256;

function project(lat: number, lng: number, z: number) {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { x, y };
}

function TileMap({ height }: { height: number }) {
  const { s } = useI18n();
  const [width, setWidth] = useState(0);
  const drop = useRef(new Animated.Value(0)).current;
  const p = project(CLINIC.coords.lat, CLINIC.coords.lng, ZOOM);

  useEffect(() => {
    if (width === 0) return;
    Animated.spring(drop, { toValue: 1, delay: 500, useNativeDriver: NATIVE, speed: 5, bounciness: 14 }).start();
  }, [width, drop]);

  const tiles: { key: string; left: number; top: number; uri: string }[] = [];
  if (width > 0) {
    const colsEachSide = Math.ceil(width / 2 / TILE) + 1;
    const rowsEachSide = Math.ceil(height / 2 / TILE) + 1;
    const cx = Math.floor(p.x);
    const cy = Math.floor(p.y);
    for (let dx = -colsEachSide; dx <= colsEachSide; dx++) {
      for (let dy = -rowsEachSide; dy <= rowsEachSide; dy++) {
        const tx = cx + dx;
        const ty = cy + dy;
        tiles.push({
          key: `${tx}-${ty}`,
          left: width / 2 + (tx - p.x) * TILE,
          top: height / 2 + (ty - p.y) * TILE,
          uri: `https://tile.openstreetmap.org/${ZOOM}/${tx}/${ty}.png`,
        });
      }
    }
  }

  return (
    <PressableScale onPress={() => openUrl(MAPS_URL)} hoverScale={1.01} pressScale={0.99} accessibilityLabel={s.location.open} accessibilityRole="link" style={styles.mapCard}>
      <View style={{ height, backgroundColor: "#E7EEF0", overflow: "hidden" }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} testID="map-preview">
        {tiles.map((t) => (
          <Image key={t.key} source={{ uri: t.uri }} style={{ position: "absolute", left: t.left, top: t.top, width: TILE, height: TILE }} contentFit="cover" transition={300} accessibilityLabel="" />
        ))}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: width / 2 - 24,
            top: height / 2 - 52,
            alignItems: "center",
            opacity: drop,
            transform: [{ translateY: drop.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }],
          }}
        >
          <View style={styles.pin}>
            <Ionicons name="medical" size={20} color={colors.white} />
          </View>
          <View style={styles.pinTip} />
        </Animated.View>
        <View style={styles.attribution}>
          <Text style={styles.attrText}>{s.location.attribution}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

export function Location() {
  const { s } = useI18n();
  const { isWide, bp } = useLayout();

  return (
    <Section id="contact" bg={colors.white}>
      <View style={{ flexDirection: isWide ? "row" : "column", gap: pick(bp, { phone: 28, tablet: 40, desktop: 64 }), alignItems: isWide ? "center" : "stretch" }}>
        <View style={{ flex: isWide ? 1 : undefined, gap: 22 }}>
          <Reveal>
            <SectionHeader eyebrow={s.location.eyebrow} title={s.location.title} />
          </Reveal>
          <Reveal delay={80}>
            <View style={styles.addr}>
              <IconBadge name="location" size={52} />
              <View style={{ flex: 1 }}>
                {CLINIC.addressLines.map((l) => (
                  <Text key={l} style={styles.addrLine} selectable>
                    {l}
                  </Text>
                ))}
              </View>
            </View>
          </Reveal>
          <Reveal delay={110}>
            <View style={{ gap: 12 }}>
              <ContactRow icon="call" label={s.contact.phone}>
                <PhoneLink size={17} testID="contact-phone" icon={false} />
              </ContactRow>
              <ContactRow icon="mail" label={s.contact.email}>
                <Pressable onPress={() => openUrl(mailUrl)} accessibilityRole="link" testID="contact-email">
                  <Text style={styles.contactLink}>{CLINIC.email}</Text>
                </Pressable>
              </ContactRow>
            </View>
          </Reveal>
          <Reveal delay={140}>
            <Button label={s.location.open} icon="navigate" onPress={() => openUrl(MAPS_URL)} />
          </Reveal>
          <Reveal delay={200}>
            <T variant="small">{s.location.note}</T>
          </Reveal>
        </View>
        <Reveal delay={100} style={{ flex: isWide ? 1.25 : undefined }}>
          <TileMap height={pick(bp, { phone: 260, tablet: 340, desktop: 380 })} />
        </Reveal>
      </View>
    </Section>
  );
}

const styles = StyleSheet.create({
  mapCard: { borderRadius: radius.xl, overflow: "hidden", borderWidth: 1, borderColor: colors.line, ...shadow.lift },
  pin: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.tealDark, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.white, boxShadow: "0 6px 16px rgba(6,25,36,0.4)" },
  pinTip: { width: 0, height: 0, marginTop: -3, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: colors.tealDark },
  attribution: { position: "absolute", right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.8)", paddingHorizontal: 7, paddingVertical: 2, borderTopLeftRadius: 8 },
  attrText: { fontFamily: fonts.medium, fontSize: 10, color: colors.inkSoft },
  contactLabel: { fontFamily: fonts.semibold, fontSize: 11.5, letterSpacing: 0.8, textTransform: "uppercase", color: colors.muted },
  contactLink: { fontFamily: fonts.bold, fontSize: 17, color: colors.tealDark, textDecorationLine: "underline", textDecorationColor: "#0B7C8666" },
  addr: { flexDirection: "row", alignItems: "center", gap: 16 },
  addrLine: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 27, color: colors.ink },
});
