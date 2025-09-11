import { TZDate } from "@date-fns/tz";
import { addDays, addWeeks, getWeek, getYear, startOfWeek, subDays } from "date-fns";

import { IPeriode } from "~/models/rapporteringsperiode.server";
import { formaterDato } from "~/utils/dato.utils";
import { TIDSSONER } from "~/utils/types";

const dateFormat = "yyyy-MM-dd";

export function lagPeriodeDatoFor(uke: number, år: number): IPeriode {
  const startdato = addWeeks(
    startOfWeek(new TZDate(Date.UTC(år, 0, 1), TIDSSONER.OSLO), { weekStartsOn: 1 }),
    uke - 1,
  );

  return {
    fraOgMed: formaterDato({ dato: startdato, dateFormat }),
    tilOgMed: formaterDato({ dato: addDays(startdato, 13), dateFormat }),
  };
}

export function beregnNåværendePeriodeDato(): IPeriode {
  const uke = getWeek(new TZDate(new Date(), TIDSSONER.OSLO), { weekStartsOn: 1 }) - 2;
  const år = getYear(new TZDate(new Date(), TIDSSONER.OSLO));

  return lagPeriodeDatoFor(uke, år);
}

export function beregnForrigePeriodeDato(fraOgMed: string): IPeriode {
  const startdato = subDays(new TZDate(fraOgMed, TIDSSONER.OSLO), 14);

  return {
    fraOgMed: formaterDato({ dato: startdato, dateFormat }),
    tilOgMed: formaterDato({ dato: addDays(startdato, 13), dateFormat }),
  };
}
