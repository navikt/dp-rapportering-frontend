import { BodyLong, Heading } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import styles from "~/routes-styles/rapportering.module.css";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.korriger.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  return (
    <>
      <main className={classNames(styles.rapporteringKontainer)}>
        <Heading size={"medium"} level={"2"} spacing={true}>
          Din korrigering er nå lagret og sendt til NAV
        </Heading>
        <BodyLong spacing>
          Perioden vil bli beregnet på nytt [så snart som mulig]. Du vil snart få informasjon fra
          NAV om det har konsekvensre for ekstra utbetaling eller tilbakekreving av penger.
        </BodyLong>
        <div className={styles.graaBakgrunn}>
          <Kalender rapporteringsperiode={periode} aapneModal={() => {}} />
          <div className={styles.registertMeldeperiodeKontainer}>
            <AktivitetOppsummering rapporteringsperiode={periode} />
          </div>
        </div>
      </main>
    </>
  );
}
