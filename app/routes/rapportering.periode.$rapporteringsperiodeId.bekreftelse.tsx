import { BodyLong, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  return (
    <div className="rapportering-kontainer">
      <Heading
        ref={sidelastFokusRef}
        className="vo-fokus"
        tabIndex={-1}
        size={"medium"}
        level={"2"}
        spacing={true}
      >
        Tusen takk!
      </Heading>
      <BodyLong spacing>
        Du har sendt inn rapporteringen din. Når perioden er over vil NAV beregne dagpengene dine.
      </BodyLong>
      <div className="graa-bakgrunn">
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
        <div className="registert-meldeperiode-kontainer">
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </div>

      <div className="navigasjon-kontainer">
        <RemixLink
          as="Button"
          to={`/rapportering/periode/${periode.id}/avgodkjenn`}
          variant="secondary"
        >
          Angre innsending
        </RemixLink>
        <RemixLink as="Button" to="/rapportering">
          Tilbake til min side
        </RemixLink>
      </div>
    </div>
  );
}
