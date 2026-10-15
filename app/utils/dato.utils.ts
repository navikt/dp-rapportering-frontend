import { TZDate } from "@date-fns/tz";
import { format, getISOWeek } from "date-fns";
import { enGB, nb } from "date-fns/locale";

import { DecoratorLocale } from "./dekoratoren.utils";
import { TIDSSONER } from "./types";

export const DATOFORMAT_MED_AAR = "d. MMMM yyyy";

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

export function formaterArbeidssokerperiode(
  nesteMeldeperiode: { fraOgMed: Date; tilOgMed: Date },
  locale: DecoratorLocale = DecoratorLocale.NB,
  dagensDato = new Date(),
) {
  const { fraOgMed, tilOgMed } = nesteMeldeperiode;
  const datoformatFra =
    fraOgMed.getFullYear() !== tilOgMed.getFullYear() ||
    fraOgMed.getFullYear() !== dagensDato.getFullYear()
      ? DATOFORMAT_MED_AAR
      : "d. MMMM";

  return {
    fom: formaterDato({ dato: fraOgMed, dateFormat: datoformatFra, locale }),
    tom: formaterDato({ dato: tilOgMed, dateFormat: DATOFORMAT_MED_AAR, locale }),
  };
}

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string, language: DecoratorLocale) {
  const fom = formaterDato({ dato: fraOgMed, dateFormat: DATOFORMAT_MED_AAR, locale: language });
  const tom = formaterDato({ dato: tilOgMed, dateFormat: DATOFORMAT_MED_AAR, locale: language });

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
