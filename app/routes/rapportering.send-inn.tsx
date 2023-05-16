import { Left, Right } from "@navikt/ds-icons";
import { RemixLink } from "~/components/RemixLink";
import styles from "./rapportering.module.css";
import { Checkbox, Heading, Ingress } from "@navikt/ds-react";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";

export function meta() {
  return [
    {
      title: "Dagpenger rapportering",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

export default function SendInn() {
  return (
    <>
      <Heading level="2" size="large" spacing>
        Ikke åpent for å sende inn enda
      </Heading>
      <Ingress spacing>
        Du må vente til fredag 4. november for at det skal være mulig å sende inn meldekortet. Alle
        endringer du har gjort vil være lagret, så neste gang du logger inn og besøker
        dagpenge-rapporteringen vil du kunne fortsette der du slapp
      </Ingress>

      <Checkbox value="Fremst">
        Send meg varsling på sms når det er mulig å sende meldekort.
      </Checkbox>

      <div className={styles.registertMeldeperiodeKontainer}>
        <Heading level="3" size="medium" spacing>
          Dette er det du har registrert for meldeperioden:
        </Heading>
        <AktivitetOppsummering />
      </div>

      <div className={styles.navigasjonKontainer}>
        <RemixLink to="/rapportering" as="Button" variant="secondary" icon={<Left />}>
          Forrige steg
        </RemixLink>
        <RemixLink
          to=""
          as="Button"
          variant="primary"
          icon={<Right />}
          iconPosition="right"
          disabled
        >
          Send til nav
        </RemixLink>
      </div>
      <div className={styles.avbrytKnapp}>
        <RemixLink to="" as="Button" variant="tertiary-neutral">
          Avbryt
        </RemixLink>
      </div>
    </>
  );
}
