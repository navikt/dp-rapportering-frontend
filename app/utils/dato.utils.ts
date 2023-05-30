import { format, getISOWeek, subDays } from "date-fns";

export function formaterPeriodeDato(fraOgMed: string, tilOgMed: string) {
  const fom = format(new Date(fraOgMed), "dd.MM.yyyy");
  const tom = format(new Date(tilOgMed), "dd.MM.yyyy");

  return `${fom} - ${tom}`;
}

export function formaterPeriodeTilUkenummer(
  fraOgMed: string,
  tilOgMed: string
) {
  const forsteDagIAndreUke = subDays(new Date(tilOgMed), 6);
  const startUkenummer = getISOWeek(new Date(fraOgMed));
  const sluttUkenummer = getISOWeek(new Date(forsteDagIAndreUke));

  return `${startUkenummer} - ${sluttUkenummer}`;
}
