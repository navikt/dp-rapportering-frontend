import { Heading } from '@navikt/ds-react';
import { Outlet } from '@remix-run/react';
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
