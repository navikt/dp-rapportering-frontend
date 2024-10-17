import styles from "./AktivitetOppsummering.module.css";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { hentTotaltArbeidstimerTekst, hentTotaltFravaerTekstMedType } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  periode: IRapporteringsperiode;
}

export function AktivitetOppsummering({ periode }: IProps) {
  const { getAppText } = useSanity();

  return (
    <div className={styles.aktivitetOppsummeringKontainer}>
      <h4>{getAppText("rapportering-oppsummering-tittel")}</h4>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.arbeid)}>
        <p>
          {getAppText("rapportering-arbeid")}
          <span>{hentTotaltArbeidstimerTekst(periode, getAppText)}</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.sykdom)}>
        <p>
          {getAppText("rapportering-syk")}
          <span>{hentTotaltFravaerTekstMedType(periode, AktivitetType.Syk, getAppText)}</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.ferie)}>
        <p>
          {getAppText("rapportering-fraevaer")}
          <span>{hentTotaltFravaerTekstMedType(periode, AktivitetType.Fravaer, getAppText)}</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.utdanning)}>
        <p>
          {getAppText("rapportering-utdanning")}
          <span>{hentTotaltFravaerTekstMedType(periode, AktivitetType.Utdanning, getAppText)}</span>
        </p>
      </div>
    </div>
  );
}
