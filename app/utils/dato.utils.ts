import { format, getISOWeek } from "date-fns";

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string) {
  const fom = format(new Date(fraOgMed), "dd.MM.yyyy");
  const tom = format(new Date(tilOgMed), "dd.MM.yyyy");

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function getWeekDays(locale: string): { kort: string; lang: string }[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const weekDays = new Array(7).fill(null).map((_, index) => {
    const date = new Date(Date.UTC(2017, 0, 2 + index)); // 2017-01-02 is just a random Monday
    return {
      kort: date.toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
      lang: date.toLocaleDateString(locale, { weekday: "long" }),
    };
  });

  return weekDays;
}
