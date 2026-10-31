import Ionicons from "@expo/vector-icons/Ionicons";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CLINIC } from "../clinic";
import { useI18n } from "../i18n";
import { useLayout } from "../lib/layout";
import { mailUrl, openUrl, telUrl, whatsappUrl } from "../lib/openUrl";
import { colors, fonts, radius } from "../theme";
import { IconBadge, PressableScale, T } from "./ui";

const NATIVE = Platform.OS !== "web";
const SHEET_TRAVEL = 560;

type ContactCtx = { open: () => void; close: () => void };
const Ctx = createContext<ContactCtx>({ open: () => {}, close: () => {} });
export const useContact = () => useContext(Ctx);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => {
    setMounted(true);
    setVisible(true);
  }, []);
  const close = useCallback(() => setVisible(false), []);
  const value = useMemo(() => ({ open, close }), [open, close]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {mounted ? <Sheet visible={visible} onClose={close} onHidden={() => setMounted(false)} /> : null}
    </Ctx.Provider>
  );
}

function Sheet({ visible, onClose, onHidden }: { visible: boolean; onClose: () => void; onHidden: () => void }) {
  const { s } = useI18n();
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;
  const drag = useRef(new Animated.Value(0)).current;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 380 : 240,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start(({ finished }) => {
      if (finished && !visible) {
        drag.setValue(0);
        onHidden();
      }
    });
  }, [visible, progress, drag, onHidden]);

  useEffect(() => {
    if (!visible) return;
    if (Platform.OS === "web") {
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeRef.current();
      return true;
    });
    return () => sub.remove();
  }, [visible]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
        onPanResponderMove: (_e, g) => drag.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_e, g) => {
          if (g.dy > 90 || g.vy > 0.9) {
            closeRef.current();
          } else {
            Animated.spring(drag, { toValue: 0, useNativeDriver: NATIVE, bounciness: 6 }).start();
          }
        },
      }),
    [drag],
  );

  const callNow = () => {
    onClose();
    void openUrl(telUrl);
  };
  const whatsapp = () => {
    onClose();
    void openUrl(whatsappUrl(s.sheet.waMessage));
  };

  const slide = progress.interpolate({ inputRange: [0, 1], outputRange: [SHEET_TRAVEL, 0] });
  const scale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });

  const sheetStyle = isWide
    ? [styles.dialog, { opacity: progress, transform: [{ scale }] }]
    : [
        styles.sheet,
        {
          paddingBottom: Math.max(insets.bottom, 12) + 14,
          transform: [{ translateY: Animated.add(slide, drag) }],
        },
      ];

  return (
    <View style={styles.root} pointerEvents="box-none" accessibilityViewIsModal>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={s.sheet.close} />
      </Animated.View>
      <View style={[styles.anchor, isWide ? styles.anchorCenter : styles.anchorBottom]} pointerEvents="box-none">
        <Animated.View style={sheetStyle} accessibilityRole="none">
          <View {...(isWide ? {} : pan.panHandlers)} style={styles.handleZone}>
            {!isWide ? <View style={styles.handle} /> : null}
            <View style={styles.titleRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.title}>{s.sheet.title}</Text>
                <T variant="small">{s.sheet.subtitle}</T>
              </View>
              {isWide ? (
                <Pressable onPress={onClose} accessibilityLabel={s.sheet.close} hitSlop={10} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={colors.inkSoft} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View style={styles.numberPill}>
            <Ionicons name="call" size={16} color={colors.tealDark} />
            <Text style={styles.number} selectable>
              {CLINIC.phoneDisplay}
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Option
              icon="call"
              title={s.sheet.call}
              sub={s.sheet.callSub}
              tint={colors.tealSoft}
              color={colors.tealDark}
              onPress={callNow}
              testID="sheet-call"
            />
            <Option
              icon="logo-whatsapp"
              title={s.sheet.whatsapp}
              sub={s.sheet.whatsappSub}
              tint="#DFF8E8"
              color="#12A150"
              onPress={whatsapp}
              testID="sheet-whatsapp"
            />
          </View>

          <Pressable onPress={() => openUrl(mailUrl)} style={styles.emailRow} accessibilityRole="link">
            <Ionicons name="mail-outline" size={16} color={colors.muted} />
            <Text style={styles.emailText}>{CLINIC.email}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

function Option({
  icon,
  title,
  sub,
  tint,
  color,
  onPress,
  testID,
}: {
  icon: "call" | "logo-whatsapp";
  title: string;
  sub: string;
  tint: string;
  color: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <PressableScale onPress={onPress} accessibilityLabel={title} pressScale={0.975} style={styles.option}>
      <View testID={testID} style={styles.optionInner} nativeID={testID}>
        <IconBadge name={icon} size={52} tint={tint} color={color} />
        <View style={{ flex: 1 }}>
          <Text style={styles.optionTitle}>{title}</Text>
          <T variant="small">{sub}</T>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, zIndex: 1000 },
  backdrop: { backgroundColor: "rgba(6, 25, 36, 0.58)" },
  anchor: { flex: 1 },
  anchorBottom: { justifyContent: "flex-end" },
  anchorCenter: { alignItems: "center", justifyContent: "center" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 16,
    boxShadow: "0 -14px 40px rgba(6, 25, 36, 0.25)",
  },
  dialog: {
    width: 460,
    maxWidth: "92%",
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: 28,
    gap: 18,
    boxShadow: "0 30px 80px rgba(6, 25, 36, 0.4)",
  },
  handleZone: { gap: 14 },
  handle: { alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.line, marginBottom: 2 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 29, color: colors.ink },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  numberPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.tealSoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  number: { fontFamily: fonts.bold, fontSize: 16, color: colors.tealDark, letterSpacing: 0.3 },
  option: { borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  optionInner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  optionTitle: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, marginBottom: 1 },
  emailRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 4 },
  emailText: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
});
