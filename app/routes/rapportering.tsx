import { Left, Right } from '@navikt/ds-icons';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { RemixLink } from '~/components/RemixLink';
import { PeriodeKalender } from '~/components/periode-kalender/PeriodeKalender';
import styles from './rapportering.module.css';

export function meta() {
  return [
    {
      title: 'Dagpenger rapportering',
      description: 'rapporteringløsning for dagpenger',
    },
  ];
}

export default function Rapportering() {
  return (
    <main>
      <div>
        <Heading level='1' size='xlarge'>
          Dagpengerapportering
        </Heading>
        <p>Uke 43 - 44 (24.10.22 - 06.11.22)</p>
      </div>
      <div>
        <h2>Utfylling</h2>
        <PeriodeKalender />
      </div>

      <div className={styles.periodeKontainer}>
        <p>Sammenlagt for meldeperioden:</p>
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

      <div className={styles.navigasjonKontainer}>
        <RemixLink to='' as='Button' variant='secondary' icon={<Left />}>
          Mine side
        </RemixLink>
        <RemixLink to='' as='Button' variant='primary' icon={<Right />} iconPosition='right'>
          Neste steg
        </RemixLink>
      </div>

      {/* <div className={styles.avbrytKnapp}>
        <RemixLink to='' as='Button' variant='tertiary-neutral'>
          Avbryt
        </RemixLink>
      </div> */}
    </main>
  );
}
