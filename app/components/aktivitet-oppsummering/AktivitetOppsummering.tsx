import styles from "./AktivitetOppsummering.module.css";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentTotaltArbeidstimerTekst, hentTotaltFravaerTekstMedType } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function AktivitetOppsummering(props: IProps) {
  const { getAppText } = useSanity();

  const rapporteringsperiode = props.rapporteringsperiode;

  return (
    <>
      <div className={styles.aktivitetOppsummeringKontainer}>
        <p className="tekst-subtil">{getAppText("rapportering-oppsummering-tittel")}</p>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.arbeid)}>
          <p>
            {getAppText("rapportering-arbeid")}
            <span>{hentTotaltArbeidstimerTekst(rapporteringsperiode)}</span>
          </p>
        </div>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.sykdom)}>
          <p>
            {getAppText("rapportering-syk")}
            <span>{hentTotaltFravaerTekstMedType(rapporteringsperiode, "Syk")}</span>
          </p>
        </div>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.ferie)}>
          <p>
            {getAppText("rapportering-fraevaer")}
            <span>{hentTotaltFravaerTekstMedType(rapporteringsperiode, "Fravaer")}</span>
          </p>
        </div>
        <div className={classNames(styles.aktivitetOppsummeringData, styles.utdanning)}>
          <p>
            {getAppText("rapportering-utdanning")}
            <span>{hentTotaltFravaerTekstMedType(rapporteringsperiode, "Utdanning")}</span>
          </p>
        </div>
      </div>
    </>
  );
}
