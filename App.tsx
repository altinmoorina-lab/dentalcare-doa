import { Fraunces_600SemiBold } from "@expo-google-fonts/fraunces/600SemiBold";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_500Medium } from "@expo-google-fonts/plus-jakarta-sans/500Medium";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_700Bold } from "@expo-google-fonts/plus-jakarta-sans/700Bold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef } from "react";
import { Animated, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { About } from "./src/components/About";
import { ContactProvider } from "./src/components/ContactSheet";
import { Footer } from "./src/components/Footer";
import { Gallery } from "./src/components/Gallery";
import { Header } from "./src/components/Header";
import { Hero } from "./src/components/Hero";
import { Hours } from "./src/components/Hours";
import { Location } from "./src/components/Location";
import { NavContext, type SectionId } from "./src/components/NavContext";
import { QuickInfo } from "./src/components/QuickInfo";
import { ScrollBus, ScrollBusContext } from "./src/components/Reveal";
import { Reviews } from "./src/components/Reviews";
import { Services } from "./src/components/Services";
import { StickyCall } from "./src/components/StickyCall";
import { LanguageProvider } from "./src/i18n";
import { ReviewsProvider } from "./src/lib/reviews";
import { colors } from "./src/theme";

const NATIVE = Platform.OS !== "web";

function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const bus = useRef(new ScrollBus()).current;
  const ys = useRef<Partial<Record<SectionId, number>>>({}).current;
  const { height } = useWindowDimensions();
  bus.viewportHeight = height;

  const nav = useMemo(
    () => ({
      setY: (id: SectionId, y: number) => {
        ys[id] = y;
      },
      scrollTo: (id: SectionId) => {
        const y = id === "top" ? 0 : Math.max((ys[id] ?? 0) - 12, 0);
        scrollRef.current?.scrollTo({ y, animated: true });
      },
    }),
    [ys],
  );

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: NATIVE,
        listener: () => bus.emit(),
      }),
    [scrollY, bus],
  );
  const onLayoutEmit = useCallback(() => bus.emit(), [bus]);

  return (
    <NavContext.Provider value={nav}>
      <ScrollBusContext.Provider value={bus}>
        <ContactProvider>
          <View style={styles.root}>
            <Animated.ScrollView
              ref={scrollRef as never}
              onScroll={onScroll}
              onContentSizeChange={onLayoutEmit}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              automaticallyAdjustKeyboardInsets
              contentContainerStyle={{ backgroundColor: colors.white }}
            >
              <Hero scrollY={scrollY} />
              <QuickInfo />
              <About />
              <Services />
              <Reviews />
              <Gallery />
              <Hours />
              <Location />
              <Footer />
            </Animated.ScrollView>
            <Header />
            <StickyCall />
          </View>
        </ContactProvider>
      </ScrollBusContext.Provider>
    </NavContext.Provider>
  );
}

export default function App() {
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Fraunces_600SemiBold,
  });

  if (!loaded && !error) {
    return <View style={[styles.root, { backgroundColor: colors.navy }]} />;
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <ReviewsProvider>
          <StatusBar style="light" />
          <Home />
        </ReviewsProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
