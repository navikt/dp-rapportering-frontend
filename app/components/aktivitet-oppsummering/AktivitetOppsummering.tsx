import classNames from "classnames";
import styles from "./AktivitetOppsummering.module.css";
import { useRouteLoaderData } from "@remix-run/react";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { TAktivitetType } from "~/models/aktivitet.server";

export function AktivitetOppsummering() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as {
    rapporteringsperiode: IRapporteringsperiode;
  };

  function hentTotaltTimerStringMedAktivitetsType(aktivitetType: TAktivitetType): string {
    const filtertAktiviteter = rapporteringsperiode.aktiviteter.filter(
      (aktivitet) => aktivitet.type === aktivitetType
    );

    const timer = filtertAktiviteter.reduce((accumulator, current) => {
      return accumulator + (current.timer ? current.timer : 1); //quickfix for å vise hele dager på aktiviteter som ikke har timer i seg
    }, 0);

    return timer.toString().replace(/\./g, ",");
  }

  return (
    <div className={styles.aktivitetOppsummeringKontainer}>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.arbeid)}>
        <p>
          Arbeid
          <span>{hentTotaltTimerStringMedAktivitetsType("Arbeid")} timer</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.sykdom)}>
        <p>
          Syk
          <span>{hentTotaltTimerStringMedAktivitetsType("Syk")} dager</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.ferie)}>
        <p>
          Fravær / Ferie
          <span>{hentTotaltTimerStringMedAktivitetsType("Ferie")} dager</span>
        </p>
      </div>
    </div>
  );
}
