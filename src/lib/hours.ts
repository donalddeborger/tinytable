// Eenvoudige lezer voor OpenStreetMap-openingsuren ("Mo-Fr 10:00-22:00; Sa,Su 09:00-23:00").
// Geeft true/false als het zeker is, en null als de notatie te ingewikkeld is.

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function dayIndex(d: string): number {
  return DAYS.indexOf(d);
}

function parseDays(spec: string): Set<number> | null {
  const days = new Set<number>();
  for (const part of spec.split(",")) {
    const range = part.trim().split("-");
    if (range.length === 1) {
      const i = dayIndex(range[0]);
      if (i < 0) return null;
      days.add(i);
    } else if (range.length === 2) {
      let a = dayIndex(range[0]);
      const b = dayIndex(range[1]);
      if (a < 0 || b < 0) return null;
      for (let n = 0; n < 7; n++) {
        days.add(a);
        if (a === b) break;
        a = (a + 1) % 7;
      }
    } else return null;
  }
  return days;
}

function minutes(t: string): number | null {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function isOpenAt(hours: string | undefined, date: Date): boolean | null {
  if (!hours) return null;
  const text = hours.trim();
  if (text === "24/7") return true;

  // Maandag = 0
  const today = (date.getDay() + 6) % 7;
  const yesterday = (today + 6) % 7;
  const now = date.getHours() * 60 + date.getMinutes();
  let state: boolean | null = false;
  let understood = false;

  // Regels staan achter elkaar met ";" of soms met ", " vóór een nieuwe dag.
  const rules = text.split(/;|,\s+(?=(?:Mo|Tu|We|Th|Fr|Sa|Su|PH)\b)/);
  for (const raw of rules) {
    const rule = raw.trim();
    if (!rule) continue;
    if (/^PH\b/.test(rule)) continue; // feestdagen negeren
    const m = rule.match(/^([A-Za-z,\- ]+?)\s+(off|closed|[\d:,\- +]+)$/);
    let days: Set<number> | null;
    let times: string;
    if (m) {
      days = parseDays(m[1].replace(/\s/g, ""));
      times = m[2].trim();
    } else if (/^[\d:,\- ]+$/.test(rule)) {
      days = new Set([0, 1, 2, 3, 4, 5, 6]);
      times = rule;
    } else {
      return null;
    }
    if (!days) return null;
    understood = true;

    if (times === "off" || times === "closed") {
      if (days.has(today)) state = false;
      continue;
    }
    let openNow = false;
    for (const span of times.split(",")) {
      const [fromRaw, toRaw] = span.replace("+", "").split("-");
      const from = minutes(fromRaw ?? "");
      let to = minutes(toRaw ?? "");
      if (from === null || to === null) return null;
      if (to <= from) to += 24 * 60; // over middernacht
      if (days.has(today) && now >= from && now < to) openNow = true;
      if (days.has(yesterday) && to > 24 * 60 && now < to - 24 * 60) openNow = true;
    }
    // Latere regels gaan voor op eerdere voor dezelfde dag.
    if (days.has(today) || days.has(yesterday)) {
      if (openNow) state = true;
      else if (days.has(today)) state = false;
    }
  }
  return understood ? state : null;
}

// Maakt de notatie leesbaar: "Mo-Fr 10:00-22:00; Sa off" -> "ma–vr 10:00–22:00 · za gesloten".
const DAY_LABEL: Record<"nl" | "en", Record<string, string>> = {
  nl: { Mo: "ma", Tu: "di", We: "wo", Th: "do", Fr: "vr", Sa: "za", Su: "zo", PH: "feestdagen" },
  en: { Mo: "Mon", Tu: "Tue", We: "Wed", Th: "Thu", Fr: "Fri", Sa: "Sat", Su: "Sun", PH: "holidays" },
};

export function formatHours(hours: string, lang: "nl" | "en" = "nl"): string {
  const labels = DAY_LABEL[lang];
  return hours
    .replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH)\b/g, (d) => labels[d])
    .replace(/\boff\b|\bclosed\b/gi, lang === "nl" ? "gesloten" : "closed")
    .replace(/24\/7/g, lang === "nl" ? "dag en nacht open" : "open 24/7")
    .replace(/(\d{2}:\d{2})-(\d{2}:\d{2})/g, "$1–$2")
    .replace(/([a-z]{2,3})-([a-z]{2,3})/gi, "$1–$2")
    .replace(/,(?=\d)/g, ", ")
    .replace(/\s*;\s*|,\s+(?=[a-z]{2,3}\b)/gi, " · ")
    .replace(/([a-z]),(?=[a-z])/gi, "$1, ");
}

export type TodayHours = {
  open: boolean; // nu open?
  spans: [string, string][]; // openingsblokken van vandaag
  lateUntil: string | null; // nog open sinds gisteren, tot dit uur
};

const hhmm = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

// Openingsuren voor de dag van `date`. null = notatie niet begrepen.
export function todayHours(hours: string | undefined, date: Date): TodayHours | null {
  if (!hours) return null;
  const text = hours.trim();
  if (text === "24/7") return { open: true, spans: [["00:00", "24:00"]], lateUntil: null };
  const open = isOpenAt(text, date);
  if (open === null) return null;

  const today = (date.getDay() + 6) % 7;
  const yesterday = (today + 6) % 7;
  const now = date.getHours() * 60 + date.getMinutes();
  let spans: [number, number][] = [];
  let ySpans: [number, number][] = [];

  const rules = text.split(/;|,\s+(?=(?:Mo|Tu|We|Th|Fr|Sa|Su|PH)\b)/);
  for (const raw of rules) {
    const rule = raw.trim();
    if (!rule || /^PH\b/.test(rule)) continue;
    const m = rule.match(/^([A-Za-z,\- ]+?)\s+(off|closed|[\d:,\- +]+)$/);
    const days = m ? parseDays(m[1].replace(/\s/g, "")) : new Set([0, 1, 2, 3, 4, 5, 6]);
    const times = m ? m[2].trim() : rule;
    if (!days) return null;
    const list: [number, number][] = [];
    if (times !== "off" && times !== "closed") {
      for (const span of times.split(",")) {
        const [a, b] = span.replace("+", "").split("-");
        const from = minutes(a ?? "");
        let to = minutes(b ?? "");
        if (from === null || to === null) return null;
        if (to <= from) to += 1440;
        list.push([from, to]);
      }
    }
    // Latere regels gaan voor op eerdere voor dezelfde dag.
    if (days.has(today)) spans = list;
    if (days.has(yesterday)) ySpans = list;
  }

  const late = ySpans.find(([, to]) => to > 1440 && now < to - 1440);
  return {
    open,
    spans: spans.map(([a, b]) => [hhmm(a), b === 1440 ? "24:00" : hhmm(b)]),
    lateUntil: late ? hhmm(late[1]) : null,
  };
}
