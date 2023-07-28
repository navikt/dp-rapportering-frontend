import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { Heading } from "@navikt/ds-react";
import { format } from "date-fns";
import nbLocale from "date-fns/locale/nb";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function PeriodeHeaderDetaljer({ rapporteringsperiode }: IProps) {
  const { fraOgMed, tilOgMed, beregnesEtter, status } = rapporteringsperiode;

  return (
    <>
      <Heading level="3" size="medium">
        Uke
        {formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}
      </Heading>
      <span>{formaterPeriodeDato(fraOgMed, tilOgMed)}</span>
      {(status === "TilUtfylling" || status === "Godkjent") && (
        <p>
          Beregnes etter: {format(new Date(beregnesEtter), "EEEE d. MMMM", { locale: nbLocale })}
        </p>
      )}
    </>
  );
}
