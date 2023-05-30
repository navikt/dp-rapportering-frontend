import type { IAktivitet, TAktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

export interface IStrukturertRapporteringsperiode {
  id: string;
  fraOgMed: string;
  tilOgMed: string;
  status: string;
  dager: IStrukturertRapporteringsperiodeDag[];
}

interface IStrukturertRapporteringsperiodeDag {
  dagIndex: number;
  dato: string;
  aktiviteter: IAktivitet[];
  muligeAktiviteter: TAktivitetType[];
}

export function sorterOgStrukturerRapporteringsperiode(
  rapporteringsperiode: IRapporteringsperiode
) {
  const sortertPeriode = {
    ...rapporteringsperiode,
    dager: rapporteringsperiode.dager.sort((a, b) => a.dagIndex - b.dagIndex),
  };

  const periodeMedGrupperteAktiviteter = {
    ...sortertPeriode,
    dager: sortertPeriode.dager.map((dag) => {
      const aktiviteter = rapporteringsperiode.aktiviteter.filter(
        (aktivitet) => aktivitet.dato === dag.dato
      );

      return { ...dag, aktiviteter };
    }),
  };

  const { aktiviteter, ...strukturertRapporteringsperiode } = periodeMedGrupperteAktiviteter;

  return strukturertRapporteringsperiode;
}
