import styles from "./AktivitetOppsummering.module.css";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentTotaltArbeidstimerTekst, hentTotaltFravaerTekstMedType } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
}

export function AktivitetOppsummering({ rapporteringsperiode }: IProps) {
  const { getAppText } = useSanity();

  return (
    <div className={styles.aktivitetOppsummeringKontainer}>
      <h4>{getAppText("rapportering-oppsummering-tittel")}</h4>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.arbeid)}>
        <p>
          {getAppText("rapportering-arbeid")}
          <span>{hentTotaltArbeidstimerTekst(rapporteringsperiode, getAppText)}</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.sykdom)}>
        <p>
          {getAppText("rapportering-syk")}
          <span>{hentTotaltFravaerTekstMedType(rapporteringsperiode, "Syk", getAppText)}</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.ferie)}>
        <p>
          {getAppText("rapportering-fraevaer")}
          <span>{hentTotaltFravaerTekstMedType(rapporteringsperiode, "Fravaer", getAppText)}</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.utdanning)}>
        <p>
          {getAppText("rapportering-utdanning")}
          <span>
            {hentTotaltFravaerTekstMedType(rapporteringsperiode, "Utdanning", getAppText)}
          </span>
        </p>
      </div>
    </div>
  );
}
