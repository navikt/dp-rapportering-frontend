import { beregnForrigePeriodeDato, beregnNåværendePeriodeDato } from "./periodedato";
import { addDays, format, subDays } from "date-fns";
import { times } from "remeda";
import { uuidv7 as uuid } from "uuidv7";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeStatus,
} from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/utils/types";

export function lagRapporteringsperiode(props = {}): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: uuid(),
    periode: {
      fraOgMed,
      tilOgMed,
    },
    dager: times(14, (i) => ({
      dagIndex: i,
      dato: "",
      aktiviteter: [],
    })),
    sisteFristForTrekk: null,
    kanSendesFra: "",
    kanSendes: true,
    kanEndres: true,
    bruttoBelop: null,
    begrunnelseEndring: "",
    status: IRapporteringsperiodeStatus.TilUtfylling,
    mottattDato: null,
    registrertArbeidssoker: null,
    originalId: null,
    html: null,
    rapporteringstype: Rapporteringstype.harAktivitet,
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
    status: IRapporteringsperiodeStatus.TilUtfylling,
    kanEndres: false,
    kanSendes: true,
  };
}

export function hentEndringsId(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: uuid(),
  };
}
