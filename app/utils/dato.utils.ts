import { format, getISOWeek } from "date-fns";
import { enGB, nb } from "date-fns/locale";

import { DecoratorLocale } from "./dekoratoren.utils";

export function formaterDato(date: Date, language: DecoratorLocale = DecoratorLocale.NB) {
  const locale = [DecoratorLocale.NB, DecoratorLocale.NN].includes(language) ? nb : enGB;

  return format(date, "d. MMMM", { locale });
}

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string, language: DecoratorLocale) {
  const locale = [DecoratorLocale.NB, DecoratorLocale.NN].includes(language) ? nb : enGB;

  const fom = format(new Date(fraOgMed), "dd. MMMM yyyy", { locale });
  const tom = format(new Date(tilOgMed), "dd. MMMM yyyy", { locale });

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function getWeekDays(locale: string): { kort: string; lang: string }[] {
  const weekDays = new Array(7).fill(null).map((_, index) => {
    const date = new Date(Date.UTC(2017, 0, 2 + index)); // 2017-01-02 is just a random Monday
    return {
      kort: date.toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
      lang: date.toLocaleDateString(locale, { weekday: "long" }),
    };
  });

  return weekDays;
}
