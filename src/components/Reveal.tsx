import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, View, type StyleProp, type ViewStyle } from "react-native";

const NATIVE = Platform.OS !== "web";

export class ScrollBus {
  private listeners = new Set<() => void>();
  viewportHeight = 800;
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  emit() {
    this.listeners.forEach((fn) => fn());
  }
}

export const ScrollBusContext = createContext<ScrollBus | null>(null);

let reduceMotion = false;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => {
    reduceMotion = !!v;
  })
  .catch(() => {});

export function Reveal({
  children,
  delay = 0,
  from = "bottom",
  distance = 28,
  style,
}: {
  children: ReactNode;
  delay?: number;
  from?: "bottom" | "left" | "right" | "none";
  distance?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const bus = useContext(ScrollBusContext);
  const ref = useRef<View>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const shown = useRef(false);

  const show = useCallback(() => {
    if (shown.current) return;
    shown.current = true;
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 700,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: NATIVE,
    }).start();
  }, [delay, progress]);

  const check = useCallback(() => {
    if (shown.current) return;
    const node = ref.current;
    if (!node) return;
    node.measureInWindow((_x, y, _w, h) => {
      const vh = bus?.viewportHeight ?? 800;
      if (y === 0 && h === 0) return;
      if (y < vh * 0.94 && y + h > 0) show();
    });
  }, [bus, show]);

  useEffect(() => {
    const unsub = bus?.subscribe(check);
    const timers = [setTimeout(check, 80), setTimeout(check, 500)];
    if (!bus) show();
    return () => {
      unsub?.();
      timers.forEach(clearTimeout);
    };
  }, [bus, check, show]);

  const translate = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  const transform =
    from === "none"
      ? []
      : from === "bottom"
        ? [{ translateY: translate }]
        : [{ translateX: from === "left" ? Animated.multiply(translate, -1) : translate }];

  return (
    <Animated.View ref={ref} onLayout={check} style={[{ opacity: progress, transform }, style]}>
      {children}
    </Animated.View>
  );
}
