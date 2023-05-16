import classNames from "classnames";
import styles from "./AktivitetOppsummering.module.css";

export function AktivitetOppsummering() {
  return (
    <div className={styles.aktivitetOppsummeringKontainer}>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.aktivitetTypeArbeid)}>
        <p>
          Arbeid
          <span>34,5 timer</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.aktivitetTypeSyk)}>
        <p>
          Syk
          <span>2 dager</span>
        </p>
      </div>
      <div className={classNames(styles.aktivitetOppsummeringData, styles.aktivitetTypeFerie)}>
        <p>
          Fravær / Ferie
          <span>2 dager</span>
        </p>
      </div>
    </div>
  );
}
