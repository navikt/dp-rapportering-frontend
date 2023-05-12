import { Left, Right } from '@navikt/ds-icons';
import { Heading } from '@navikt/ds-react';
import classNames from 'classnames';
import { RemixLink } from '~/components/RemixLink';
import { PeriodeKalender } from '~/components/periode-kalender/PeriodeKalender';
import styles from './rapportering.module.css';
import { Outlet } from '@remix-run/react';

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
    <>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level='1' size='xlarge'>
            Dagpengerapportering
          </Heading>
          <p>Uke 43 - 44 (24.10.22 - 06.11.22)</p>
        </div>
      </div>

      <main className={styles.rapporteringKontainer}>
        <Outlet />
      </main>
    </>
  );
}
