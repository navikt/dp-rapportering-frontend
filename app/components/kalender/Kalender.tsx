import { Heading, Modal } from '@navikt/ds-react';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import styles from './Kalender.module.css';
import { RemixLink } from '../RemixLink';

export function Kalender() {
  const perioder = [24, 25, 26, 27, 28, 29, 30, 31, 1, 2, 3, 4, 5, 6];
  const helgIndex = [5, 6, 12, 13];

  const [open, setOpen] = useState(false);
  const [modalHeaderTekst, setModalHeaderTekst] = useState('');

  useEffect(() => {
    Modal.setAppElement('#dp-rapportering-frontend');
  }, []);

  function hentDatoIndeksTilUkedag(index: number) {
    switch (index) {
      case 0:
      case 7:
        return 'Mandag';
      case 1:
      case 8:
        return 'Tirsdag';
      case 2:
      case 9:
        return 'Onsdag';
      case 3:
      case 10:
        return 'Torsdag';
      case 4:
      case 11:
        return 'Fredag';
      case 5:
      case 12:
        return 'Lørdag';
      case 6:
      case 13:
        return 'Søndag';
    }
  }

  function aapneModal(dato: number, datoIndex: number) {
    setOpen(true);

    const ukedag = hentDatoIndeksTilUkedag(datoIndex);
    setModalHeaderTekst(`${ukedag} ${dato}`);
  }

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
        {perioder.map((dato, index) => {
          return (
            <div
              className={classNames(styles.kalenderDato, {
                [styles.helg]: helgIndex.includes(index),
              })}
              key={index}
              role='button'
              onClick={() => aapneModal(dato, index)}
            >
              <p>{dato}</p>.
            </div>
          );
        })}
      </div>
      <Modal
        open={open}
        aria-label='Modal demo'
        onClose={() => setOpen((x) => !x)}
        aria-labelledby='modal-heading'
        className={styles.timerforingModal}
      >
        <Modal.Content>
          <Heading spacing level='1' size='medium' id='modal-heading'>
            {modalHeaderTekst}
          </Heading>
          <div className={styles.timeTypeKontainer}>
            <div role='button' className={classNames(styles.timeType, styles.fargekodeArbeid)}>
              Arbeid
            </div>
            <div role='button' className={classNames(styles.timeType, styles.fargekodeSyk)}>
              Syk
            </div>
            <div role='button' className={classNames(styles.timeType, styles.fargekodeTiltak)}>
              Tiltak
            </div>
            <div
              role='button'
              className={classNames(styles.timeType, styles.fargekodeFravaerFerie)}
            >
              Fravær / Ferie
            </div>
          </div>

          <div className={styles.knappKontainer}>
            <RemixLink
              to=''
              as='Button'
              variant='tertiary-neutral'
              onClick={() => setOpen((x) => !x)}
            >
              Avbryt
            </RemixLink>
            <RemixLink to='send-inn' as='Button' variant='primary'>
              Lagre
            </RemixLink>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
}
