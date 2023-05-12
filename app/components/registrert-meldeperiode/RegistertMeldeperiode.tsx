import classNames from 'classnames';
import styles from './RegistertMeldeperiode.module.css';

export function RegistertMeldeperiode() {
  return (
    <div className={styles.periodeKontainer}>
      <div className={classNames(styles.perioderData, styles.arbeid)}>
        <p>
          Arbeid
          <span>34,5 timer</span>
        </p>
      </div>
      <div className={classNames(styles.perioderData, styles.syk)}>
        <p>
          Syk
          <span>2 dager</span>
        </p>
      </div>
    </div>
  );
}
