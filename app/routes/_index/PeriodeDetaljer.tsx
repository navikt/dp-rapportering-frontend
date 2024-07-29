import { Alert, BodyShort, Heading } from "@navikt/ds-react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentForstePeriodeTekst } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

export function PeriodeDetaljer({
  rapporteringsperioder,
}: {
  rapporteringsperioder: IRapporteringsperiode[];
}) {
  const { getAppText } = useSanity();

  const antallPerioder = rapporteringsperioder.length;
  const harFlerePerioder = antallPerioder > 1;

  if (antallPerioder > 0) {
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
        <Heading size="small">
          {antallPerioder > 1
            ? getAppText("rapportering-forste-periode")
            : getAppText("rapportering-navaerende-periode")}
        </Heading>
        <BodyShort textColor="subtle">{hentForstePeriodeTekst(rapporteringsperioder)}</BodyShort>
      </div>
    );
  }
  return <>{getAppText("rapportering-ingen-rapporter-å-fylle-ut")}</>;
}
