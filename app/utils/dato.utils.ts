import { format, getISOWeek } from "date-fns";

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string) {
  const fom = format(new Date(fraOgMed), "dd.MM.yyyy");
  const tom = format(new Date(tilOgMed), "dd.MM.yyyy");

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(fraOgMed: string, tilOgMed: string) {
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(tilOgMed));

  return ` ${startUkenummer} - ${sluttUkenummer}`;
}
