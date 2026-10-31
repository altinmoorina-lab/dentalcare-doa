import { createContext, useContext } from "react";

export type SectionId = "top" | "about" | "services" | "reviews" | "gallery" | "hours" | "contact";

export type Nav = {
  setY: (id: SectionId, y: number) => void;
  scrollTo: (id: SectionId) => void;
};

export const NavContext = createContext<Nav>({ setY: () => {}, scrollTo: () => {} });
export const useNav = () => useContext(NavContext);
