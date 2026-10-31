import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform, Pressable, Text, type TextStyle } from "react-native";
import { CLINIC } from "../clinic";
import { colors, fonts } from "../theme";
import { useContact } from "./ContactSheet";

export function PhoneLink({ color = colors.tealDark, size = 17, icon = true, testID }: { color?: string; size?: number; icon?: boolean; testID?: string }) {
  const contact = useContact();
  return (
    <Pressable
      onPress={contact.open}
      accessibilityRole="link"
      accessibilityLabel={CLINIC.phoneDisplay}
      testID={testID}
      style={[{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start" }, Platform.OS === "web" ? ({ cursor: "pointer" } as object) : null]}
    >
      {icon ? <Ionicons name="call" size={size} color={color} /> : null}
      <Text style={[{ fontFamily: fonts.bold, fontSize: size, color, textDecorationLine: "underline", textDecorationColor: `${color}66` } as TextStyle]}>
        {CLINIC.phoneDisplay}
      </Text>
    </Pressable>
  );
}
