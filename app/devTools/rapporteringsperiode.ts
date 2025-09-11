import { TZDate } from "@date-fns/tz";
import { addDays, format, subDays } from "date-fns";
import { times } from "remeda";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeStatus, KortType, TIDSSONER } from "~/utils/types";

import { beregnForrigePeriodeDato, beregnNåværendePeriodeDato } from "./periodedato";

function createId(): string {
  return String(Math.floor(Math.random() * 10_000_000_000));
}

export function lagRapporteringsperiode(props = {}): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: createId(),
    type: KortType.ELEKTRONISK,
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
    rapporteringstype: null,
    ...props,
  };

  meldekort.kanSendesFra = format(
    subDays(new TZDate(meldekort.periode.tilOgMed, TIDSSONER.OSLO), 1),
    "yyyy-MM-dd",
  );
  meldekort.dager = meldekort.dager.map((dag, index) => ({
    ...dag,
    dato: format(
      addDays(new TZDate(meldekort.periode.fraOgMed, TIDSSONER.OSLO), index),
      "yyyy-MM-dd",
    ),
  }));

  return meldekort;
}

export function lagForstRapporteringsperiode() {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();
  return lagRapporteringsperiode({ periode: { fraOgMed, tilOgMed } });
}

export function leggTilForrigeRapporteringsperiode(
  navaerendePeriode: IRapporteringsperiode["periode"],
) {
  const { fraOgMed, tilOgMed } = beregnForrigePeriodeDato(navaerendePeriode.fraOgMed);
  return lagRapporteringsperiode({ id: createId(), periode: { fraOgMed, tilOgMed } });
}

export function startEndring(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: createId(),
    originalId: navaerendePeriode.id,
    status: IRapporteringsperiodeStatus.TilUtfylling,
    kanEndres: false,
    kanSendes: true,
  };
}

export function hentEndringsId(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: createId(),
  };
}
