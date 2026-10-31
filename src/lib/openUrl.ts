import { Linking, Platform } from "react-native";
import { CLINIC } from "../clinic";

export async function openUrl(url: string): Promise<void> {
  // On desktop browsers a new tab for tel:/mailto: often ends up blank; navigate in place instead.
  if (Platform.OS === "web" && /^(tel|mailto|sms):/i.test(url)) {
    const a = document.createElement("a");
    a.href = url;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
  try {
    await Linking.openURL(url);
  } catch {
    /* no handler available (e.g. simulator without a dialer) */
  }
}

export const telUrl = `tel:${CLINIC.phone}`;
export const mailUrl = `mailto:${CLINIC.email}`;
export const whatsappUrl = (message: string) =>
  `https://wa.me/${CLINIC.whatsappNumber}?text=${encodeURIComponent(message)}`;
