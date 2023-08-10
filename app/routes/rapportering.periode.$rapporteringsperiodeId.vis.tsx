import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import styles from "~/routes-styles/rapportering.module.css";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

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
