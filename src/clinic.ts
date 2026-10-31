export type DayHours = { open: string; close: string } | null;

export const CLINIC = {
  name: "DentalCare DOA",
  doctor: "Dr. spec. Shkumbin Bajrami",
  phone: "+38349331466",
  phoneDisplay: "+383 49 331 466",
  whatsappNumber: "38349331466",
  email: "dentalcaredoa@gmail.com",
  instagram: "dentalcaredoa.ks",
  instagramUrl: "https://www.instagram.com/dentalcaredoa.ks/",
  addressLines: ["Bulevardi Nënë Tereza", "10000 Prishtinë, Kosovë"],
  mapQuery: "Bulevardi Nënë Tereza, Prishtinë",
  coords: { lat: 42.6629, lng: 21.1655 },
  // Monday → Sunday. Times are Prishtina local time.
  hours: [
    { open: "09:00", close: "19:00" },
    { open: "09:00", close: "19:00" },
    { open: "09:00", close: "19:00" },
    { open: "09:00", close: "19:00" },
    { open: "09:00", close: "19:00" },
    { open: "09:00", close: "14:00" },
    null,
  ] as DayHours[],
};

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${CLINIC.coords.lat},${CLINIC.coords.lng}`;
