import { TZDate } from "@date-fns/tz";
import { format, getISOWeek } from "date-fns";
import { enGB, nb } from "date-fns/locale";

import { DecoratorLocale } from "./dekoratoren.utils";
import { TIDSSONER } from "./types";

interface IFormaterDatoProps {
  dato: Date;
  locale?: DecoratorLocale;
  dateFormat?: string;
}

export function formaterDato({
  dato,
  locale = DecoratorLocale.NB,
  dateFormat = "d. MMMM",
}: IFormaterDatoProps) {
  const dateFnsLocale = [DecoratorLocale.NB, DecoratorLocale.NN].includes(locale) ? nb : enGB;

  return format(new TZDate(dato, TIDSSONER.OSLO), dateFormat, {
    locale: dateFnsLocale,
  });
}

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string, language: DecoratorLocale) {
  const locale = [DecoratorLocale.NB, DecoratorLocale.NN].includes(language) ? nb : enGB;

  const fom = format(new TZDate(fraOgMed, TIDSSONER.OSLO), "dd. MMMM yyyy", { locale });
  const tom = format(new TZDate(tilOgMed, TIDSSONER.OSLO), "dd. MMMM yyyy", { locale });

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
