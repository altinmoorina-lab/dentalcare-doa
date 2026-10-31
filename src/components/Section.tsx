import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { pick, useLayout } from "../lib/layout";
import { Container } from "./ui";
import { useNav, type SectionId } from "./NavContext";

export function Section({
  id,
  children,
  bg,
  style,
  padTop,
  padBottom,
}: {
  id: SectionId;
  children: ReactNode;
  bg?: string;
  style?: StyleProp<ViewStyle>;
  padTop?: number;
  padBottom?: number;
}) {
  const nav = useNav();
  const { bp } = useLayout();
  const pad = pick(bp, { phone: 64, tablet: 84, desktop: 108 });
  return (
    <View
      onLayout={(e) => nav.setY(id, e.nativeEvent.layout.y)}
      style={[{ width: "100%", backgroundColor: bg, paddingTop: padTop ?? pad, paddingBottom: padBottom ?? pad }, style]}
    >
      <Container>{children}</Container>
    </View>
  );
}
