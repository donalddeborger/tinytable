"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AmenityKey, PlaceType } from "./types";

export type Lang = "nl" | "en";

const STORAGE_KEY = "tinytable-lang";

type AmenityText = { label: string; hint: string };

const AMENITY_TEXT: Record<Lang, Record<AmenityKey, AmenityText>> = {
  nl: {
    changingTable: { label: "Verschonings­tafel", hint: "Een tafel of kamer om de baby te verschonen" },
    highChairs: { label: "Kinder­stoelen", hint: "Hoogstoelen of kinderstoelen aan tafel" },
    playCorner: { label: "Speelhoek", hint: "Een hoekje of speelgoed voor kinderen" },
    kidsMenu: { label: "Kinder­aanbod", hint: "Kindermenu, kinderportie, babyccino of kinderdrankje" },
    playground: { label: "Buiten­speeltuin", hint: "Een speeltuin buiten, bij of vlak naast de horecazaak" },
    stroller: { label: "Kinderwagen­vriendelijk", hint: "Vlot binnen en genoeg plaats voor een kinderwagen" },
  },
  en: {
    changingTable: { label: "Changing table", hint: "A table or room to change the baby" },
    highChairs: { label: "High chairs", hint: "High chairs or kids' chairs at the table" },
    playCorner: { label: "Play corner", hint: "A corner or toys for children" },
    kidsMenu: { label: "Kids' options", hint: "Kids' menu, kids' portions, babyccino or kids' drinks" },
    playground: { label: "Outdoor play­ground", hint: "A playground outside, at or right next to the venue" },
    stroller: { label: "Pram-friendly", hint: "Easy to get in, with room for a pram or buggy" },
  },
};

const TYPE_TEXT: Record<Lang, Record<PlaceType, string>> = {
  nl: { restaurant: "Restaurant", bar: "Koffiebar", cafe: "Café" },
  en: { restaurant: "Restaurant", bar: "Coffee bar", cafe: "Pub" },
};

const nl = {
  tagline: "Kindvriendelijk eten & drinken · Antwerpen",
  pageTitle: "TinyTable — kindvriendelijk eten en drinken in Antwerpen",
  add: "Toevoegen",
  searchPlaceholder: "Zoek een restaurant, café of koffiebar",
  search: "Zoeken",
  clear: "Wissen",
  inTinyTable: "In TinyTable",
  noInfoYet: "Nog geen info · tik om toe te voegen",
  showOnMap: "Toon op de kaart",
  filterLabel: "Filter op voorziening",
  all: "Alles",
  openNowState: "Nu open",
  closedNow: "Nu gesloten",
  hoursLabel: "Openingsuren",
  todayOpen: (ranges: string) => `Vandaag open ${ranges}`,
  todayClosed: "Vandaag gesloten",
  openUntil: (time: string) => `Open tot ${time}`,
  hourRange: (a: string, b: string) => `van ${a} tot ${b}`,
  rangeAnd: " en ",
  midnight: "middernacht",
  allDay: "Vandaag de hele dag open",
  welcome: "Kindvriendelijk",
  welcomeRule: (n: number) => `TinyTable-label: minstens ${n} van de 5 hartjes`,
  superWelcome: "Super kindvriendelijk",
  superRule: "TinyTable-label: minstens 4 van de 5 hartjes",
  loading: "Laden",
  myLocation: "Mijn locatie",
  addPlace: "Horecazaak toevoegen",
  view: "Weergave",
  map: "Kaart",
  list: "Lijst",
  loadFailed: "De locaties konden niet worden geladen",
  noGeo: "Je browser kan je locatie niet bepalen",
  geoFailed: "Locatie kon niet worden bepaald",
  outsideAntwerp: "TinyTable werkt voorlopig in de provincie Antwerpen.",
  updated: "Dank je wel! 💕 De info is bijgewerkt.",
  alreadyIn: "Deze horecazaak staat al in TinyTable",
  added: "Horecazaak toegevoegd — bedankt voor het delen!",
  place: "locatie",
  places: "locaties",
  sort: "Sorteren",
  bestScore: "Beste score",
  nearby: "Dichtbij",
  emptyList: "Nog geen locaties die hieraan voldoen.",
  addFirst: "Voeg de eerste toe",
  yes: "Ja",
  no: "Nee",
  unknown: "Onbekend",
  dontKnow: "Weet ik niet",
  close: "Sluiten",
  share: "Delen",
  shareSite: "Deel TinyTable",
  shareSiteText: "Handig voor ouders: kindvriendelijke restaurants en cafés in Antwerpen op één kaart 👉",
  shareSiteAsk: "Ken je ouders die dit handig vinden?",
  shareText: (name: string) => `Kijk eens, kindvriendelijk: ${name} op TinyTable`,
  helpParents: "Help andere ouders en vul in wat er is",
  needsInfo: "Nog aan te vullen",
  needsInfoTitle: (n: number) => `${n} van de 6 voorzieningen ingevuld. Weet jij meer? Vul aan!`,
  details: "Gegevens",
  locked: "Vast",
  name: "Naam",
  address: "Adres",
  type: "Soort horecazaak",
  whatForKids: "Wat is er voor kinderen?",
  note: "Extra toelichting (optioneel)",
  notePlaceholder: "Bijv. verschoningstafel zit in het toilet beneden",
  cancel: "Annuleren",
  save: "Bewaren",
  saving: "Bewaren…",
  publish: "Publiceren",
  route: "Wandelroute",
  openNowFilter: "Nu open",
  openNowHint: "Toont locaties die nu open zijn (volgens de gekende openingsuren)",
  menuOwners: "Voor horecazaken",
  editInfo: "Info aanpassen",
  lastUpdated: "Laatst bijgewerkt op",
  placePage: "Eigen pagina om te delen",
  aboutLink: "Over TinyTable · Contact · Privacy",
  menu: "Menu",
  menuTowns: "Per district/gemeente",
  menuAbout: "Over TinyTable",
  menuHearts: "Hoe werken de hartjes?",
  menuContact: "Contact",
  menuPrivacy: "Privacy",
  menuInstall: "Zet op beginscherm",
  welcomeTitle: "Welkom bij TinyTable!",
  welcomeSub: "Kindvriendelijk eten & drinken in Antwerpen",
  welcomeTiles: [
    ["Zoek", "op de kaart of in de lijst"],
    ["Vergelijk", "meer hartjes = kind\u00ADvriendelijker"],
    ["Vul aan", "ken je een leuke plek?"],
  ] as [string, string][],
  welcomeStart: "Aan de slag",
  installTitle: "TinyTable op je beginscherm",
  installStepsIos: [
    "Tik in Safari op het deel-icoon (vierkantje met pijl omhoog). Zie je het niet? Tik dan eerst op •••.",
    "Kies 'Zet op beginscherm'.",
    "Tik op 'Voeg toe'. TinyTable staat nu als app tussen je andere apps.",
  ],
  installStepsAndroid: [
    "Tik rechtsboven in je browser op ⋮ (drie puntjes).",
    "Kies 'Toevoegen aan startscherm' of 'App installeren'.",
    "Bevestig. TinyTable staat nu als app tussen je andere apps.",
  ],
  installOk: "Begrepen",
  fromOsm: "uit OpenStreetMap, nog niet bevestigd door ouders",
  confirmedBy: (n: number) => (n === 1 ? "bevestigd door 1 ouder" : `bevestigd door ${n} ouders`),
  stillCorrect: "Klopt deze info nog?",
  noChange: "Nee, aanpassen",
  thanksConfirm: "Dank je wel! 💕",
  confirmedToast: "Dank je wel! 💕 Zo blijft de info juist voor andere ouders.",
  goalText: (n: number, goal: number) => `${n} van de ${goal} kindvriendelijke plekjes`,
  goalCta: "Voeg toe",
  goalLabel: "Help ons de 100 kindvriendelijkste plekjes van Antwerpen te verzamelen",
  thanksTitle: "Dank je wel! 💕",
  thanksAdded: (n: number, goal: number) =>
    n >= goal
      ? `Je tip staat op de kaart! We hebben nu ${n} kindvriendelijke plekjes. Het doel van ${goal} is bereikt, en we gaan gewoon door!`
      : `Je tip staat op de kaart! We hebben nu ${n} van de ${goal} kindvriendelijke plekjes. Nog ${goal - n} te gaan!`,
  thanksSubmitted: "We kijken het even na; daarna verschijnt het op de kaart. Samen gaan we voor 100 plekjes!",
  thanksAddedPlain: "Je tip staat op de kaart. Zo help je andere ouders op weg!",
  thanksSubmittedPlain: "We kijken het even na; daarna verschijnt het op de kaart.",
  campaignTitle: "Help ons de 100 kindvriendelijkste adressen van Antwerpen te verzamelen",
  campaignText: "Wat is jouw favoriete plekje met de kids? Voeg het toe in 1 minuut, gratis en zonder account.",
  campaignCta: "Voeg jouw favoriet toe",
  campaignLater: "Eerst rondkijken",
  thanksShare: "Vraag je vriendinnen om mee te helpen",
  thanksShareText: "Help mee de 100 kindvriendelijkste plekjes van Antwerpen te verzamelen 💕 Wat is jouw favoriete plekje met de kids?",
  thanksMore: "Nog een plekje toevoegen",
  needName: "Geef de horecazaak een naam",
  genericError: "Er ging iets mis, probeer het opnieuw",
  newPlace: "Nieuwe horecazaak · geen account nodig",
  findHint: "Zoek de horecazaak op naam en kies ze uit de lijst.",
  venuePlaceholder: "Naam van het restaurant, café of koffiebar",
  findVenue: "Horecazaak zoeken",
  searching: "Zoeken…",
  nothingFound: "Niets gevonden in de provincie Antwerpen. Probeer een andere schrijfwijze.",
  alreadyBadge: "Al in TinyTable",
  lookingUp: "Adres opzoeken…",
  change: "Wijzig",
  kidFriendliness: "Kindvriendelijkheid",
  notRatedLower: "nog niet beoordeeld",
  outOf5: (r: string) => `${r} op 5`,
  switchTo: "Switch to English",
  notFoundQ: "Horecazaak niet gevonden?",
  addManually: "Voeg ze zelf toe",
  manualHint: "Vul de gegevens zelf in. We kijken de horecazaak na voor ze op de kaart verschijnt.",
  streetNr: "Straat en huisnummer",
  streetPlaceholder: "Bijv. Kloosterstraat 12",
  postcode: "Postcode",
  postcodePlaceholder: "Bijv. 2800",
  back: "Terug",
  sendForReview: "Insturen",
  sending: "Insturen…",
  submitted: "Bedankt! We kijken de horecazaak na; na goedkeuring verschijnt ze op de kaart.",
  needStreet: "Vul straat en huisnummer in",
  needPostcode: "Geef een postcode uit de provincie Antwerpen (2000–2999)",
};

export type Dict = typeof nl;

const en: Dict = {
  tagline: "Kid-friendly food & drinks · Antwerp",
  pageTitle: "TinyTable — kid-friendly food and drinks in Antwerp",
  add: "Add",
  searchPlaceholder: "Search a restaurant, pub or coffee bar",
  search: "Search",
  clear: "Clear",
  inTinyTable: "In TinyTable",
  noInfoYet: "No info yet · tap to add",
  showOnMap: "Show on map",
  filterLabel: "Filter by facility",
  all: "All",
  openNowState: "Open now",
  closedNow: "Closed now",
  hoursLabel: "Opening hours",
  todayOpen: (ranges: string) => `Open today ${ranges}`,
  todayClosed: "Closed today",
  openUntil: (time: string) => `Open until ${time}`,
  hourRange: (a: string, b: string) => `from ${a} to ${b}`,
  rangeAnd: " and ",
  midnight: "midnight",
  allDay: "Open all day today",
  welcome: "Family friendly",
  welcomeRule: (n: number) => `TinyTable label: at least ${n} of 5 hearts`,
  superWelcome: "Super family friendly",
  superRule: "TinyTable label: at least 4 of 5 hearts",
  loading: "Loading",
  myLocation: "My location",
  addPlace: "Add a place",
  view: "View",
  map: "Map",
  list: "List",
  loadFailed: "The places could not be loaded",
  noGeo: "Your browser can't determine your location",
  geoFailed: "Your location could not be determined",
  outsideAntwerp: "TinyTable covers the province of Antwerp for now.",
  updated: "Thank you! 💕 The info has been updated.",
  alreadyIn: "This place is already in TinyTable",
  added: "Place added — thanks for sharing!",
  place: "place",
  places: "places",
  sort: "Sort",
  bestScore: "Best score",
  nearby: "Nearby",
  emptyList: "No places match this yet.",
  addFirst: "Add the first one",
  yes: "Yes",
  no: "No",
  unknown: "Unknown",
  dontKnow: "Don't know",
  close: "Close",
  share: "Share",
  shareSite: "Share TinyTable",
  shareSiteText: "Handy for parents: family-friendly restaurants and cafés in Antwerp on one map 👉",
  shareSiteAsk: "Know parents who'd find this useful?",
  shareText: (name: string) => `Have a look, family friendly: ${name} on TinyTable`,
  helpParents: "Help other parents and fill in what's there",
  needsInfo: "Needs more info",
  needsInfoTitle: (n: number) => `${n} of 6 amenities filled in. Know more? Add it!`,
  details: "Details",
  locked: "Fixed",
  name: "Name",
  address: "Address",
  type: "Type of place",
  whatForKids: "What's there for kids?",
  note: "Extra note (optional)",
  notePlaceholder: "E.g. the changing table is in the downstairs toilet",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  publish: "Publish",
  route: "Walking route",
  openNowFilter: "Open now",
  openNowHint: "Shows places that are open right now (based on known opening hours)",
  menuOwners: "For venues",
  editInfo: "Edit info",
  lastUpdated: "Last updated on",
  placePage: "Shareable page",
  aboutLink: "About TinyTable · Contact · Privacy",
  menu: "Menu",
  menuTowns: "By district/town",
  menuAbout: "About TinyTable",
  menuHearts: "How do the hearts work?",
  menuContact: "Contact",
  menuPrivacy: "Privacy",
  menuInstall: "Add to home screen",
  welcomeTitle: "Welcome to TinyTable!",
  welcomeSub: "Family-friendly eating & drinking in Antwerp",
  welcomeTiles: [
    ["Search", "on the map or in the list"],
    ["Compare", "more hearts = more family friendly"],
    ["Add", "know a nice spot?"],
  ] as [string, string][],
  welcomeStart: "Let's go",
  installTitle: "TinyTable on your home screen",
  installStepsIos: [
    "In Safari, tap the share icon (square with an arrow up). Don't see it? Tap ••• first.",
    "Choose 'Add to Home Screen'.",
    "Tap 'Add'. TinyTable now sits among your other apps.",
  ],
  installStepsAndroid: [
    "Tap ⋮ (three dots) at the top right of your browser.",
    "Choose 'Add to Home screen' or 'Install app'.",
    "Confirm. TinyTable now sits among your other apps.",
  ],
  installOk: "Got it",
  fromOsm: "from OpenStreetMap, not yet confirmed by parents",
  confirmedBy: (n: number) => (n === 1 ? "confirmed by 1 parent" : `confirmed by ${n} parents`),
  stillCorrect: "Is this info still correct?",
  noChange: "No, edit",
  thanksConfirm: "Thank you! 💕",
  confirmedToast: "Thank you! 💕 This keeps the info right for other parents.",
  goalText: (n: number, goal: number) => `${n} of ${goal} family-friendly spots`,
  goalCta: "Add",
  goalLabel: "Help us collect the 100 most family-friendly spots in Antwerp",
  thanksTitle: "Thank you! 💕",
  thanksAdded: (n: number, goal: number) =>
    n >= goal
      ? `Your tip is on the map! We now have ${n} family-friendly spots. We reached our goal of ${goal}, and we keep going!`
      : `Your tip is on the map! We now have ${n} of ${goal} family-friendly spots. ${goal - n} to go!`,
  thanksSubmitted: "We'll have a quick look; after that it appears on the map. Together we're going for 100 spots!",
  thanksAddedPlain: "Your tip is on the map. You're helping other parents!",
  thanksSubmittedPlain: "We'll have a quick look; after that it appears on the map.",
  campaignTitle: "Help us collect the 100 most family-friendly spots in Antwerp",
  campaignText: "What's your favourite spot with the kids? Add it in 1 minute, free and without an account.",
  campaignCta: "Add your favourite",
  campaignLater: "Look around first",
  thanksShare: "Ask your friends to help out",
  thanksShareText: "Help collect the 100 most family-friendly spots in Antwerp 💕 What's your favourite spot with the kids?",
  thanksMore: "Add another spot",
  needName: "Give the place a name",
  genericError: "Something went wrong, please try again",
  newPlace: "New place · no account needed",
  findHint: "Search the place by name and pick it from the list.",
  venuePlaceholder: "Name of the restaurant, pub or coffee bar",
  findVenue: "Find a place",
  searching: "Searching…",
  nothingFound: "Nothing found in the province of Antwerp. Try a different spelling.",
  alreadyBadge: "Already in TinyTable",
  lookingUp: "Looking up address…",
  change: "Change",
  kidFriendliness: "Kid-friendliness",
  notRatedLower: "not rated yet",
  outOf5: (r: string) => `${r} out of 5`,
  switchTo: "Overschakelen naar Nederlands",
  notFoundQ: "Can't find the place?",
  addManually: "Add it yourself",
  manualHint: "Fill in the details yourself. We'll review the place before it appears on the map.",
  streetNr: "Street and number",
  streetPlaceholder: "E.g. Kloosterstraat 12",
  postcode: "Postcode",
  postcodePlaceholder: "E.g. 2800",
  back: "Back",
  sendForReview: "Submit",
  sending: "Submitting…",
  submitted: "Thanks! We'll review the place; once approved it will appear on the map.",
  needStreet: "Fill in the street and house number",
  needPostcode: "Enter a postcode in the province of Antwerp (2000–2999)",
};

const DICTS: Record<Lang, Dict> = { nl, en };

// Foutmeldingen van de server zijn Nederlands; vertaal de bekende.
const SERVER_ERRORS_EN: Record<string, string> = {
  "Ongeldige gegevens": "Invalid data",
  "Geef de horecazaak een naam": "Give the place a name",
  "Ongeldige locatie": "Invalid location",
  "Geen voorzieningen": "No facilities given",
  "Deze horecazaak staat al in TinyTable": "This place is already in TinyTable",
  "Even te veel aanpassingen": "Too many changes for now, please try again later",
  "Niet gevonden": "Not found",
  "De horecazaak kon niet worden bewaard": "The place could not be saved",
  "De info kon niet worden bewaard": "The info could not be saved",
  "Adres niet gevonden": "Address not found — check the street and number",
  "Vul straat en huisnummer in": "Fill in the street and house number",
  "TinyTable werkt voorlopig alleen in de provincie Antwerpen": "TinyTable only covers the province of Antwerp for now",
  "Geen postcode uit de provincie Antwerpen": "Not a postcode in the province of Antwerp",
};

export type I18n = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Dict;
  amenity: (key: AmenityKey) => AmenityText;
  typeLabel: (type: PlaceType) => string;
  ratingText: (rating: number | null) => string;
  formatDistance: (km: number) => string;
  formatDate: (iso: string) => string;
  serverError: (message: string | undefined) => string;
};

function build(lang: Lang, setLang: (lang: Lang) => void): I18n {
  const t = DICTS[lang];
  const decimal = (n: number, digits: number) =>
    lang === "nl" ? n.toFixed(digits).replace(".", ",") : n.toFixed(digits);
  return {
    lang,
    setLang,
    t,
    amenity: (key) => AMENITY_TEXT[lang][key],
    typeLabel: (type) => TYPE_TEXT[lang][type],
    ratingText: (rating) =>
      rating === null ? t.notRatedLower : t.outOf5(Number.isInteger(rating) ? String(rating) : decimal(rating, 1)),
    formatDistance: (km) =>
      km < 1 ? `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m` : `${decimal(km, km < 10 ? 1 : 0)} km`,
    formatDate: (iso) => {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) return "";
      return date.toLocaleDateString(lang === "nl" ? "nl-BE" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    serverError: (message) => {
      if (!message) return t.genericError;
      if (lang === "nl") return message;
      return SERVER_ERRORS_EN[message] ?? t.genericError;
    },
  };
}

const I18nContext = createContext<I18n>(build("nl", () => undefined));

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("nl");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    // Standaard Nederlands; Engels alleen als de bezoeker daar zelf voor koos.
    if (stored === "en") setLangState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () =>
      build(lang, (next) => {
        setLangState(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // geen opslag beschikbaar: alleen voor deze sessie
        }
      }),
    [lang],
  );

  return (
    <I18nContext.Provider value={value}>
      <title>{value.t.pageTitle}</title>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
