import { BodyLong, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { RemixLink } from "~/components/RemixLink";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.korriger.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, []);

  return (
    <>
      <main className="rapportering-kontainer">
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
          <div className="registert-meldeperiode-kontainer">
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        </div>
        <div className="navigasjon-kontainer">
          <RemixLink as="Button" to="/rapportering">
            Tilbake til min side
          </RemixLink>
        </div>
      </main>
    </>
  );
}
