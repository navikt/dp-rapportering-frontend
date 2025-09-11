import { TZDate } from "@date-fns/tz";
import { format, getISOWeek } from "date-fns";
import { enGB, nb } from "date-fns/locale";

import { DecoratorLocale } from "./dekoratoren.utils";
import { TIDSSONER } from "./types";

interface IFormaterDatoProps {
  dato: Date | string;
  locale?: DecoratorLocale;
  dateFormat?: string;
}

export function formaterDato({
  dato,
  locale = DecoratorLocale.NB,
  dateFormat = "d. MMMM",
}: IFormaterDatoProps) {
  const dateFnsLocale = [DecoratorLocale.NB, DecoratorLocale.NN].includes(locale) ? nb : enGB;

  // @ts-expect-error TZDate godtar både string og Date, så vi kan sende dato direkte
  return format(new TZDate(dato, TIDSSONER.OSLO), dateFormat, {
    locale: dateFnsLocale,
  });
}

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string, language: DecoratorLocale) {
  const fom = formaterDato({ dato: fraOgMed, dateFormat: "dd. MMMM yyyy", locale: language });
  const tom = formaterDato({ dato: tilOgMed, dateFormat: "dd. MMMM yyyy", locale: language });

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new TZDate(fraOgMed, TIDSSONER.OSLO));
  const sluttUkenummer = getISOWeek(new TZDate(tilOgMed, TIDSSONER.OSLO));

  return `${startUkenummer} - ${sluttUkenummer}`;
}

export function getWeekDays(locale: string): { kort: string; lang: string }[] {
  const weekDays = new Array(7).fill(null).map((_, index) => {
    const date = new TZDate(Date.UTC(2017, 0, 2 + index), TIDSSONER.OSLO); // 2017-01-02 is just a random Monday
    return {
      kort: date.toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
      lang: date.toLocaleDateString(locale, { weekday: "long" }),
    };
  });

  return weekDays;
}
