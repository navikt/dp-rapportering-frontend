import { beregnForrigePeriodeDato, beregnNåværendePeriodeDato } from "./periodedato";
import { addDays, format, subDays } from "date-fns";
import { times } from "remeda";
import { uuidv7 as uuid } from "uuidv7";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

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
    kanEndres: true,
    begrunnelseEndring: "",
    rapporteringstype: null,
    registrertArbeidssoker: null,
    dager: times(14, (i) => ({
      dagIndex: i,
      dato: format(addDays(new Date(fraOgMed), i), "yyyy-MM-dd"),
      aktiviteter: [],
    })),
  };
}

export function lagForstRapporteringsperiode() {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();
  return lagRapporteringsperiode(uuid(), fraOgMed, tilOgMed);
}

export function leggTilForrigeRapporteringsperiode(
  navaerendePeriode: IRapporteringsperiode["periode"]
) {
  const { fraOgMed, tilOgMed } = beregnForrigePeriodeDato(navaerendePeriode.fraOgMed);
  return lagRapporteringsperiode(uuid(), fraOgMed, tilOgMed);
}

export function startEndring(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: uuid(),
    originalId: navaerendePeriode.id,
    status: "Endret",
    kanEndres: false,
  };
}

export function hentEndringsId(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: uuid(),
  };
}
