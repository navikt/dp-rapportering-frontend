import { BodyLong, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useScrollTilSeksjon } from "~/hooks/useScrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.korriger.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  const sidelastFokusRef = useRef(null);
  const { setFocus } = useSetFokus();
  const { scrollIntoView } = useScrollTilSeksjon();

  useEffect(() => {
    scrollIntoView(sidelastFokusRef);
    setFocus(sidelastFokusRef);
  }, []);

  return (
    <>
      <main className="rapportering-kontainer">
        <Heading
          ref={sidelastFokusRef}
          tabIndex={-1}
          className="VO-fokus"
          size={"medium"}
          level={"2"}
          spacing={true}
        >
          Din korrigering er nå lagret og sendt til NAV
        </Heading>
        <BodyLong spacing>
          Perioden vil bli beregnet på nytt (så snart som mulig). Du vil snart få informasjon fra
          NAV om det har konsekvensre for ekstra utbetaling eller tilbakekreving av penger.
        </BodyLong>
        <div className="graa-bakgrunn">
          <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
          <div className="registert-meldeperiode-kontainer">
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        </div>
      </main>
    </>
  );
}
