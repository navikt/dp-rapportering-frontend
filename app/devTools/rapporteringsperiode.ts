import { beregnForrigePeriodeDato, beregnNåværendePeriodeDato } from "./periodedato";
import { addDays, format, subDays } from "date-fns";
import { times } from "remeda";
import { uuidv7 as uuid } from "uuidv7";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export function lagRapporteringsperiode(props = {}): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: uuid(),
    status: "TilUtfylling",
    periode: {
      fraOgMed,
      tilOgMed,
    },
    kanSendesFra: "",
    kanSendes: true,
    kanEndres: true,
    begrunnelseEndring: "",
    rapporteringstype: null,
    registrertArbeidssoker: null,
    dager: times(14, (i) => ({
      dagIndex: i,
      dato: "",
      aktiviteter: [],
    })),
    ...props,
  };

  meldekort.kanSendesFra = format(subDays(new Date(meldekort.periode.tilOgMed), 1), "yyyy-MM-dd");
  meldekort.dager = meldekort.dager.map((dag, index) => ({
    ...dag,
    dato: format(addDays(new Date(meldekort.periode.fraOgMed), index), "yyyy-MM-dd"),
  }));

  return meldekort;
}

export function lagForstRapporteringsperiode() {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();
  return lagRapporteringsperiode({ periode: { fraOgMed, tilOgMed } });
}

export function leggTilForrigeRapporteringsperiode(
  navaerendePeriode: IRapporteringsperiode["periode"]
) {
  const { fraOgMed, tilOgMed } = beregnForrigePeriodeDato(navaerendePeriode.fraOgMed);
  return lagRapporteringsperiode({ id: uuid(), periode: { fraOgMed, tilOgMed } });
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
