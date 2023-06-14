import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function PeriodeHeaderDetaljer({ rapporteringsperiode }: IProps) {
  const { fraOgMed, tilOgMed } = rapporteringsperiode;

  return (
    <p>
      Uke
      {formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}({formaterPeriodeDato(fraOgMed, tilOgMed)})
    </p>
  );
}
