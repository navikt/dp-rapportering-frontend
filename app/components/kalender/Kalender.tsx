import classNames from 'classnames';
import styles from './Kalender.module.css';

export function Kalender() {
  const perioder = [24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6];
  const helgIndex = [5, 6, 12, 13];

  return (
    <div className={styles.kalender}>
      <div className={styles.kalenderUkedagKontainer}>
        <div className={styles.kalenderUkedag}>man</div>
        <div className={styles.kalenderUkedag}>tir</div>
        <div className={styles.kalenderUkedag}>ons</div>
        <div className={styles.kalenderUkedag}>tor</div>
        <div className={styles.kalenderUkedag}>fre</div>
        <div className={styles.kalenderUkedag}>lør</div>
        <div className={styles.kalenderUkedag}>søn</div>
      </div>
      <div className={styles.kalenderDatoKontainer}>
        {perioder.map((periode, index) => {
          return (
            <div
              className={classNames(styles.kalenderDato, {
                [styles.helg]: helgIndex.includes(index),
              })}
              key={index}
            >
              <p>{periode}</p>.
            </div>
          );
        })}
      </div>
    </div>
  );
}
