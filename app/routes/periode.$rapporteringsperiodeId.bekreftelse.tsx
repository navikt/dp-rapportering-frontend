import { Alert, BodyLong, Heading } from "@navikt/ds-react";
import { useEffect, useRef } from "react";
import { useSanity } from "~/hooks/useSanity";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

export default function RapporteringsPeriodesBekreftelsesSide() {
  const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
  const { getAppText, getLink } = useSanity();
  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  return (
    <div className="rapportering-container">
      <Alert variant="success" className="my-4">
        <Heading spacing size="small" level="3">
          {getAppText("rapportering-periode-bekreftelse-tittel")}
        </Heading>
      </Alert>

      <BodyLong spacing>{getAppText("rapportering-periode-bekreftelse-beskrivelse")}</BodyLong>
      <div className="graa-bakgrunn">
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
        <div className="registert-meldeperiode-container">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </div>

      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={getLink("rapportering-periode-bekreftelse-tilbake").linkUrl}
          className="py-4 px-8"
        >
          {getLink("rapportering-periode-bekreftelse-tilbake").linkText}
        </RemixLink>
      </div>
    </div>
  );
}
