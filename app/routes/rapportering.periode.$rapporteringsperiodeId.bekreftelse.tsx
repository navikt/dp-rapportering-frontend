import { useRouteLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { BodyLong, Heading } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import classNames from "classnames";

export default function RapporteringLes() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;

  return (
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
        </div>
      </div>
      <main className={classNames(styles.rapporteringKontainer)}>
        <Heading size={"medium"} level={"2"} spacing={true}>
          Tusen takk
        </Heading>
        <BodyLong spacing>
          Du har nå sendt inn rapportering for perioden. Når perioden er over så vil NAV beregne sum
          og utbetale dagpenger.
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
