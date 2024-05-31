import { BodyLong, Heading } from "@navikt/ds-react";
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
      <Heading
        ref={sidelastFokusRef}
        className="vo-fokus"
        tabIndex={-1}
        size={"medium"}
        level={"2"}
        spacing={true}
      >
        {getAppText("rapportering-periode-bekreftelse-tittel")}
      </Heading>
      <BodyLong spacing>{getAppText("rapportering-periode-bekreftelse-beskrivelse")}</BodyLong>
      <div className="graa-bakgrunn">
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
        <div className="registert-meldeperiode-container">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </div>

      <div className="navigasjon-container">
        <RemixLink as="Button" to={`/periode/${periode.id}/avgodkjenn`} variant="secondary">
          {getLink("rapportering-periode-bekreftelse-avbryt").linkText}
        </RemixLink>
        <RemixLink as="Button" to={getLink("rapportering-periode-bekreftelse-tilbake").linkUrl}>
          {getLink("rapportering-periode-bekreftelse-tilbake").linkText}
        </RemixLink>
      </div>
    </div>
  );
}
