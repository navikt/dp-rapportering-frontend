import { Left, Right } from '@navikt/ds-icons';
import { Heading } from '@navikt/ds-react';
import { RemixLink } from '~/components/RemixLink';
import { RegistertMeldeperiode } from '~/components/registrert-meldeperiode/RegistertMeldeperiode';
import styles from './rapportering.module.css';
import { Kalender } from '~/components/kalender/Kalender';

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
      <Heading level='2' size='large' spacing>
        Utfylling
      </Heading>
      <Kalender />

      <div className={styles.registertMeldeperiodeKontainer}>
        <p>Sammenlagt for meldeperioden:</p>
        <RegistertMeldeperiode />
      </div>
      <div className={styles.navigasjonKontainer}>
        <RemixLink to='' as='Button' variant='secondary' icon={<Left />}>
          Mine side
        </RemixLink>
        <RemixLink
          to='send-inn'
          as='Button'
          variant='primary'
          icon={<Right />}
          iconPosition='right'
        >
          Neste steg
        </RemixLink>
      </div>
    </>
  );
}
