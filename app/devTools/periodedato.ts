import { addDays, addWeeks, format, getWeek, getYear, startOfWeek, subDays } from "date-fns";

import { IPeriode } from "~/models/rapporteringsperiode.server";

export function formatereDato(dato: Date): string {
  return format(dato, "yyyy-MM-dd");
}

export function lagPeriodeDatoFor(uke: number, år: number): IPeriode {
  const startdato = addWeeks(
    startOfWeek(new Date(Date.UTC(år, 0, 1)), { weekStartsOn: 1 }),
    uke - 1,
  );

  return {
    fraOgMed: formatereDato(startdato),
    tilOgMed: formatereDato(addDays(startdato, 13)),
  };
}

export function beregnNåværendePeriodeDato(): IPeriode {
  const uke = getWeek(new Date(), { weekStartsOn: 1 }) - 2;
  const år = getYear(new Date());

  return lagPeriodeDatoFor(uke, år);
}

export function beregnForrigePeriodeDato(fraOgMed: string): IPeriode {
  const startdato = subDays(new Date(fraOgMed), 14);

  return {
    fraOgMed: formatereDato(startdato),
    tilOgMed: formatereDato(addDays(startdato, 13)),
  };
}
