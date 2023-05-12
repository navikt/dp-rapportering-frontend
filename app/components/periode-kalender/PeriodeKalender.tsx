import classNames from 'classnames';
import styles from './PeriodeKalender.module.css';

export function PeriodeKalender() {
  return (
    <div className={styles.kalender}>
      <div className={styles.kalenderUkedag}>
        <div>man</div>
        <div className={styles.kalenderDato}>
          <p>24.</p>
        </div>
        <div className={styles.kalenderDato}>
          <p>31.</p>
        </div>
      </div>
      <div className={styles.kalenderUkedag}>
        <div>tir</div>
        <div className={styles.kalenderDato}>
          <p>25.</p>
        </div>
        <div className={styles.kalenderDato}>
          <p>2.</p>
        </div>
      </div>
      <div className={styles.kalenderUkedag}>
        <div>ons</div>
        <div className={styles.kalenderDato}>
          <p>26.</p>
        </div>
        <div className={styles.kalenderDato}>
          <p>3.</p>
        </div>
      </div>
      <div className={styles.kalenderUkedag}>
        <div>tor</div>
        <div className={styles.kalenderDato}>
          <p>27.</p>
        </div>
        <div className={styles.kalenderDato}>
          <p>4.</p>
        </div>
      </div>
      <div className={styles.kalenderUkedag}>
        <div>fre</div>
        <div className={styles.kalenderDato}>
          <p>28.</p>
        </div>
        <div className={styles.kalenderDato}>
          <p>5.</p>
        </div>
      </div>
      <div className={styles.kalenderUkedag}>
        <div>lør</div>
        <div className={classNames(styles.kalenderDato, styles.helg)}>
          <p>29.</p>
        </div>
        <div className={classNames(styles.kalenderDato, styles.helg)}>
          <p>6.</p>
        </div>
      </div>
      <div className={styles.kalenderUkedag}>
        <div>søn</div>
        <div className={classNames(styles.kalenderDato, styles.helg)}>
          <p>30.</p>
        </div>
        <div className={classNames(styles.kalenderDato, styles.helg)}>
          <p>7.</p>
        </div>
      </div>
    </div>
  );
}
