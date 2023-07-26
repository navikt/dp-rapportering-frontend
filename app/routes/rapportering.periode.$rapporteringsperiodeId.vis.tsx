import { useRouteLoaderData } from "@remix-run/react";
import styles from "~/routes/rapportering.module.css";
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
      <main
        className={classNames(styles.rapporteringKontainer, {
          [styles.graaBakgrunn]: periode.status !== "TilUtfylling",
        })}
      >
        <Kalender rapporteringsperiode={periode} aapneModal={() => {}} />
        <div className={styles.registertMeldeperiodeKontainer}>
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>
      </main>
    </>
  );
}
