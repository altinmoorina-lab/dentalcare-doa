import { Image } from "expo-image";
import { colors } from "../theme";

const logo = require("../../assets/images/clinic/logo.png");

export function Logo({ size = 44 }: { size?: number }) {
  return (
    <Image
      source={logo}
      accessibilityLabel="DentalCare DOA"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.logoDark }}
      contentFit="cover"
      transition={200}
    />
  );
}
