import { Heading } from "@navikt/ds-react";
import { useEffect, useRef } from "react";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

export default function KorrigeringBekreftelsesSide() {
  const { periode } = useTypedRouteLoaderData("routes/korriger.$rapporteringsperiodeId");

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  return (
    <>
      <div className="rapportering-container">
        <Heading
          ref={sidelastFokusRef}
          tabIndex={-1}
          className="vo-fokus"
          size={"medium"}
          level={"2"}
          spacing={true}
        >
          Korrigeringen er mottatt
        </Heading>
        <div className="graa-bakgrunn">
          <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
          <div className="registert-meldeperiode-container">
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        </div>
        <div className="navigasjon-container">
          <RemixLink as="Button" to="/rapportering">
            Tilbake til min side
          </RemixLink>
        </div>
      </div>
    </>
  );
}
