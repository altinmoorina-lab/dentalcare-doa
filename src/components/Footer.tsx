import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import { CLINIC, MAPS_URL } from "../clinic";
import { useI18n } from "../i18n";
import { useLayout } from "../lib/layout";
import { mailUrl, openUrl } from "../lib/openUrl";
import { colors, fonts } from "../theme";
import { useContact } from "./ContactSheet";
import { Logo } from "./Logo";
import { Reveal } from "./Reveal";
import { PhoneLink } from "./PhoneLink";
import { Container, PressableScale, T } from "./ui";

export function Footer() {
  const { s } = useI18n();
  const { isWide } = useLayout();
  const contact = useContact();

  return (
    <View style={styles.wrap}>
      <Container style={{ gap: 36, paddingBottom: 96 }}>
        <Reveal>
          <View style={{ flexDirection: isWide ? "row" : "column", gap: isWide ? 60 : 32, justifyContent: "space-between" }}>
            <View style={{ gap: 16, maxWidth: 380 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Logo size={52} />
                <View>
                  <Text style={styles.brand}>DentalCare DOA</Text>
                  <Text style={styles.sub}>{s.brandSub}</Text>
                </View>
              </View>
              <T color="rgba(255,255,255,0.7)" style={{ fontSize: 15 }}>
                {CLINIC.doctor} · {s.about.doctorRole}
              </T>
            </View>

            <View style={{ gap: 14 }}>
              <PhoneLink color="#8CE9E4" size={17} testID="footer-phone" />
              <FooterLink icon="mail" label={CLINIC.email} onPress={() => openUrl(mailUrl)} />
              <FooterLink icon="logo-instagram" label={`@${CLINIC.instagram}`} onPress={() => openUrl(CLINIC.instagramUrl)} />
              <FooterLink icon="location" label={CLINIC.addressLines.join(", ")} onPress={() => openUrl(MAPS_URL)} />
            </View>
          </View>
        </Reveal>

        <View style={styles.divider} />
        <View style={{ gap: 6 }}>
          <Text style={styles.small}>
            © {new Date().getFullYear()} DentalCare DOA. {s.footer.rights}
          </Text>
          <Text style={styles.small}>{s.footer.prototype}</Text>
          <Text style={styles.small}>{s.footer.credits}</Text>
        </View>
      </Container>
    </View>
  );
}

function FooterLink({ icon, label, onPress }: { icon: "mail" | "logo-instagram" | "location"; label: string; onPress: () => void }) {
  return (
    <PressableScale onPress={onPress} hoverScale={1.02} pressScale={0.97} accessibilityRole="link" accessibilityLabel={label} style={{ alignSelf: "flex-start" }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name={icon} size={17} color="#8CE9E4" />
        <Text style={styles.link}>{label}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.navy, paddingTop: 64 },
  brand: { fontFamily: fonts.display, fontSize: 22, color: colors.white },
  sub: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase", color: "rgba(255,255,255,0.6)" },
  link: { fontFamily: fonts.semibold, fontSize: 15, color: "rgba(255,255,255,0.88)" },
  divider: { height: 1, backgroundColor: "rgba(255,255,255,0.12)" },
  small: { fontFamily: fonts.medium, fontSize: 12.5, color: "rgba(255,255,255,0.5)" },
});
