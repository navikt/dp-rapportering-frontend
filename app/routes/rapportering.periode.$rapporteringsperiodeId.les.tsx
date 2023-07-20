import { useRouteLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
import { Heading } from "@navikt/ds-react";
import { Kalender } from "~/components/kalender/Kalender";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";

export default function RapporteringAlle() {
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
      <main className={styles.rapporteringKontainer}>
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} />
        <div className={styles.registertMeldeperiodeKontainer}>
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </main>
    </>
  );
}
