import { TZDate } from "@date-fns/tz";
import { addDays, subDays } from "date-fns";
import { times } from "remeda";
import { uuidv7 } from "uuidv7";

import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterDato } from "~/utils/dato.utils";
import { IRapporteringsperiodeStatus, KortType, TIDSSONER } from "~/utils/types";

import { beregnForrigePeriodeDato, beregnNåværendePeriodeDato } from "./periodedato";

export function lagRapporteringsperiode(props = {}): IRapporteringsperiode {
  const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

  const meldekort: IRapporteringsperiode = {
    id: uuidv7(),
    type: KortType.ORDINAERT,
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

  meldekort.kanSendesFra = formaterDato({
    dato: subDays(new TZDate(meldekort.periode.tilOgMed, TIDSSONER.OSLO), 1),
    dateFormat: "yyyy-MM-dd",
  });
  meldekort.dager = meldekort.dager.map((dag, index) => ({
    ...dag,
    dato: formaterDato({
      dato: addDays(new TZDate(meldekort.periode.fraOgMed, TIDSSONER.OSLO), index),
      dateFormat: "yyyy-MM-dd",
    }),
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
  return lagRapporteringsperiode({ id: uuidv7(), periode: { fraOgMed, tilOgMed } });
}

export function startEndring(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: uuidv7(),
    originalId: navaerendePeriode.id,
    status: IRapporteringsperiodeStatus.TilUtfylling,
    kanEndres: false,
    kanSendes: true,
  };
}

export function hentEndringsId(navaerendePeriode: IRapporteringsperiode): IRapporteringsperiode {
  return {
    ...navaerendePeriode,
    id: uuidv7(),
  };
}
