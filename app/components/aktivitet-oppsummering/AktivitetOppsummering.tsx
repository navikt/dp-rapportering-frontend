import classNames from "classnames";
import styles from "./AktivitetOppsummering.module.css";
import { useRouteLoaderData } from "@remix-run/react";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import type { TAktivitetType } from "~/models/aktivitet.server";
import { periodeSomTimer } from "~/utils/periode.utils";
interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function AktivitetOppsummering(props: IProps) {
  const rapporteringsperiode = props.rapporteringsperiode;

  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);

  function hentTotaltArbeidstimerTekst(): string {
    const filtertAktiviteter = flatMapAktiviteter.filter(
      (aktivitet) => aktivitet.type === "Arbeid"
    );

    const timer = filtertAktiviteter.reduce((accumulator, current) => {
      if (current.timer) {
        return accumulator + periodeSomTimer(current.timer);
      }
      return accumulator + 1;
    }, 0);

    const formattertTimer = timer.toString().replace(/\./g, ",");

    return `${formattertTimer} ${timer > 1 ? "timer" : "time"}`;
  }

  function hentTotaltFravaerTekstMedType(aktivitetType: TAktivitetType): string {
    const filtertAktiviteter = flatMapAktiviteter.filter(
      (aktivitet) => aktivitet.type === aktivitetType
    );

    return `${filtertAktiviteter.length} ${filtertAktiviteter.length > 1 ? "dager" : "dag"}`;
  }

  return (
    <>
      {flatMapAktiviteter.length < 1 && (
        <p>
          Hvis du ikke har arbeidet, vært syk eller hatt fravær i perioden så trenger du ikke å
          fylle ut noe for å sende inn rapporteringen.
        </p>
      )}
      {flatMapAktiviteter.length > 0 && (
        <div className={styles.aktivitetOppsummeringKontainer}>
          <p>Sammenlagt for meldeperioden:</p>
          <div className={classNames(styles.aktivitetOppsummeringData, styles.arbeid)}>
            <p>
              Arbeid
              <span>{hentTotaltArbeidstimerTekst()}</span>
            </p>
          </div>
          <div className={classNames(styles.aktivitetOppsummeringData, styles.sykdom)}>
            <p>
              Syk
              <span>{hentTotaltFravaerTekstMedType("Syk")}</span>
            </p>
          </div>
          <div className={classNames(styles.aktivitetOppsummeringData, styles.ferie)}>
            <p>
              Fravær / Ferie
              <span>{hentTotaltFravaerTekstMedType("Ferie")}</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
