import { BodyLong, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  const tekstForInnsending =
    "Du har nå sendt inn rapportering for perioden. Når perioden er over så vil NAV beregne sum og utbetale dagpenger.";
  const tekstEtterInnsending =
    "Du har nå sendt inn rapportering for perioden. NAV  vil fortløpende beregne sum og utbetale dagpenger.";

  return (
    <main className="rapportering-kontainer">
      <Heading size={"medium"} level={"2"} spacing={true}>
        Tusen takk!
      </Heading>
      <BodyLong spacing>
        {periode.status === "Innsendt" ? tekstEtterInnsending : tekstForInnsending}
      </BodyLong>
      <div className="graa-bakgrunn">
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} />
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
    </main>
  );
}
