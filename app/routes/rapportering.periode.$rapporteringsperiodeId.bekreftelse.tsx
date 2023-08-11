import { BodyLong, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;
  const { status } = periode;

  const tekstForInnsending: string =
    "Du har nå sendt inn rapportering for perioden. Når perioden er over så vil NAV beregne sum og utbetale dagpenger.";
  const tekstEtterInnsending: string =
    "Du har nå sendt inn rapportering for perioden. NAV  vil fortløpende beregne sum og utbetale dagpenger.";

  return (
    <>
      <main className="rapportering-kontainer">
        <Heading size={"medium"} level={"2"} spacing={true}>
          Tusen takk!
        </Heading>
        <BodyLong spacing>
          {status === "Innsendt" ? tekstEtterInnsending : tekstForInnsending}
        </BodyLong>
        <div className="graa-bakgrunn">
          <Kalender rapporteringsperiode={periode} aapneModal={() => {}} />
          <div className="registert-meldeperiode-kontainer">
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        </div>
      </main>
    </>
  );
}
