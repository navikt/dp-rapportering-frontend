import { RapporteringstypeForm } from "./RapporteringstypeForm";
import { Alert, Heading } from "@navikt/ds-react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentForstePeriodeTekst } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";

interface PeriodeDetaljerProps {
  rapporteringstype: Rapporteringstype | undefined;
  rapporteringsperioder: IRapporteringsperiode[];
}

export function PeriodeDetaljer({
  rapporteringstype,
  rapporteringsperioder,
}: PeriodeDetaljerProps) {
  const { getAppText } = useSanity();
  const antallPerioder = rapporteringsperioder.length;
  const harFlerePerioder = antallPerioder > 1;

  if (antallPerioder === 0) {
    return <>{getAppText("rapportering-ingen-rapporter-å-fylle-ut")}</>;
  }

  const rapporteringstypeFormLabel =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");

  return (
    <div className="my-8">
      {harFlerePerioder && (
        <Alert variant="info" className="my-8">
          <Heading spacing size="small" level="3">
            {getAppText("rapportering-flere-perioder-tittel").replace(
              "{antall}",
              antallPerioder.toString()
            )}
          </Heading>
          {getAppText("rapportering-flere-perioder-innledning")}
        </Alert>
      )}

      <RapporteringstypeForm
        label={rapporteringstypeFormLabel}
        description={hentForstePeriodeTekst(rapporteringsperioder)}
        rapporteringstype={rapporteringstype}
        rapporteringsperiodeId={rapporteringsperioder[0].id}
      />
    </div>
  );
}
