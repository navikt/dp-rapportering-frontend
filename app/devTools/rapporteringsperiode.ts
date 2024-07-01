import { addDays, addWeeks, format, getWeek, getYear, startOfWeek, subDays } from "date-fns";
import { times } from "remeda";
import { uuidv7 as uuid } from "uuidv7";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

//  create new period date

interface Periode {
  fraOgMed: string;
  tilOgMed: string;
}

export function lagPeriodeDatoFor(uke: number, år: number): Periode {
  const fraOgMedDato = addWeeks(
    startOfWeek(new Date(Date.UTC(år, 0, 1)), { weekStartsOn: 1 }),
    uke - 1
  );

  const fraOgMed = format(fraOgMedDato, "yyyy-MM-dd");
  const tilOgMed = format(addDays(fraOgMedDato, 13), "yyyy-MM-dd");

  return {
    fraOgMed,
    tilOgMed,
  };
}

export function lagForstPeriodeDato(): Periode {
  const now = new Date();
  const uke = getWeek(now, { weekStartsOn: 1 }) - 2;
  const ar = getYear(now);

  return lagPeriodeDatoFor(uke, ar);
}

export function finnForrigePeriodeDato(fraOgMed: string): Periode {
  const fraOgMedDato = subDays(new Date(fraOgMed), 14);
  const tilOgMedDato = subDays(fraOgMed, 1);

  return {
    fraOgMed: format(fraOgMedDato, "yyyy-MM-dd"),
    tilOgMed: format(tilOgMedDato, "yyyy-MM-dd"),
  };
}

export function lagRapporteringsperiode(
  id: string,
  fraOgMed: string,
  tilOgMed: string
): IRapporteringsperiode {
  return {
    id,
    status: "TilUtfylling",
    periode: {
      fraOgMed,
      tilOgMed,
    },
    kanSendesFra: format(subDays(new Date(tilOgMed), 1), "yyyy-MM-dd"),
    kanSendes: true,
    kanKorrigeres: true,
    registrertArbeidssoker: null,
    dager: times(14, (i) => ({
      dagIndex: i,
      dato: format(addDays(new Date(fraOgMed), i), "yyyy-MM-dd"),
      aktiviteter: [],
    })),
  };
}

export function lagForstRapporteringsperiode() {
  const { fraOgMed, tilOgMed } = lagForstPeriodeDato();
  return lagRapporteringsperiode(uuid(), fraOgMed, tilOgMed);
}

export function leggTilForrigeRapporteringsperiode(
  navaerendePeriode: IRapporteringsperiode["periode"]
) {
  const { fraOgMed, tilOgMed } = finnForrigePeriodeDato(navaerendePeriode.fraOgMed);
  return lagRapporteringsperiode(uuid(), fraOgMed, tilOgMed);
}

export function lagKorrigeringsperiode(
  navaerendePeriode: IRapporteringsperiode
): IRapporteringsperiode {
  return { ...navaerendePeriode, id: uuid(), status: "Korrigert", kanKorrigeres: false };
}
