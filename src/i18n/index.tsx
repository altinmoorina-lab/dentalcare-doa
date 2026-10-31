import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Platform } from "react-native";
import { en, sq, type Strings } from "./strings";

export type Lang = "sq" | "en";

type I18n = {
  lang: Lang;
  s: Strings;
  setLang: (l: Lang) => void;
  toggle: () => void;
  fmt: (template: string, vars: Record<string, string | number>) => string;
};

const Ctx = createContext<I18n | null>(null);
const STORAGE_KEY = "doa.lang";

function readStored(): Lang {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      if (v === "en" || v === "sq") return v;
    } catch {
      /* storage unavailable */
    }
  }
  return "sq";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sq");

  useEffect(() => {
    setLangState(readStored());
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, l);
        document.documentElement.lang = l;
      } catch {
        /* storage unavailable */
      }
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      lang,
      s: lang === "sq" ? sq : en,
      setLang,
      toggle: () => setLang(lang === "sq" ? "en" : "sq"),
      fmt: (template, vars) => template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? "")),
    }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n must be used inside LanguageProvider");
  return v;
}
