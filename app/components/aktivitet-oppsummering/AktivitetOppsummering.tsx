import styles from "./AktivitetOppsummering.module.css";
import classNames from "classnames";
import type { AktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function AktivitetOppsummering(props: IProps) {
  const { getAppText } = useSanity();

  const rapporteringsperiode = props.rapporteringsperiode;

  const flatMapAktiviteter = rapporteringsperiode.dager.flatMap((d) => d.aktiviteter);

  function hentTotaltArbeidstimerTekst(): string {
    const filtertAktiviteter = flatMapAktiviteter.filter(
      (aktivitet) => aktivitet.type === "Arbeid"
    );

    const timer = filtertAktiviteter.reduce((accumulator, current) => {
      if (current.timer) {
        return accumulator + (periodeSomTimer(current.timer) ?? 0);
      }
      return accumulator + 1;
    }, 0);

    const formattertTimer = timer.toString().replace(/\./g, ",");

    return `${formattertTimer} ${timer > 1 ? "timer" : "time"}`;
  }

  function hentTotaltFravaerTekstMedType(aktivitetType: AktivitetType): string {
    const filtertAktiviteter = flatMapAktiviteter.filter(
      (aktivitet) => aktivitet.type === aktivitetType
    );

    return `${filtertAktiviteter.length} ${filtertAktiviteter.length > 1 ? "dager" : "dag"}`;
  }

  return (
    <>
      <div className={styles.aktivitetOppsummeringKontainer}>
        <p className="tekst-subtil">Du har svart:</p>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.arbeid)}>
          <p>
            {getAppText("rapportering-arbeid")}
            <span>{hentTotaltArbeidstimerTekst()}</span>
          </p>
        </div>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.sykdom)}>
          <p>
            {getAppText("rapportering-syk")}
            <span>{hentTotaltFravaerTekstMedType("Syk")}</span>
          </p>
        </div>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.ferie)}>
          <p>
            {getAppText("rapportering-fraevaer")}
            <span>{hentTotaltFravaerTekstMedType("Fravaer")}</span>
          </p>
        </div>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.utdanning)}>
          <p>
            {getAppText("rapportering-utdanning")}
            <span>{hentTotaltFravaerTekstMedType("Utdanning")}</span>
          </p>
        </div>
      </div>
    </>
  );
}
