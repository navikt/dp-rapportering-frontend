import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Checkbox, Heading, Ingress } from "@navikt/ds-react";
import { useRouteLoaderData } from "@remix-run/react";
import { format, isFriday } from "date-fns";
import nbLocale from "date-fns/locale/nb";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { type IRapporteringLoader } from "./rapportering";

import styles from "./rapportering.module.css";

export default function RapporteringSendInnIkkeTilgjengelig() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;

  function hentForstMuligInnsendingsDato() {
    const sisteFredag = rapporteringsperiode.dager
      .filter((dag) => isFriday(new Date(dag.dato)))
      .slice(-1)[0];

    return format(new Date(sisteFredag.dato), "EEEE dd.MM.yyyy", { locale: nbLocale });
  }

  return (
    <>
      <Heading level="2" size="large" spacing>
        Ikke åpent for å sende inn enda
      </Heading>
      <Ingress spacing>
        Du må vente til {hentForstMuligInnsendingsDato()} for at det skal være mulig å sende inn
        meldekortet. Alle endringer du har gjort vil være lagret, så neste gang du logger inn og
        besøker dagpenge-rapporteringen vil du kunne fortsette der du slapp
      </Ingress>

      <Checkbox value="Fremst">
        Send meg varsling på sms når det er mulig å sende meldekort.
      </Checkbox>

      <div className={styles.registertMeldeperiodeKontainer}>
        <Heading level="3" size="small">
          Dette er det du har registrert for meldeperioden:
        </Heading>
        <AktivitetOppsummering rapporteringsperiode={rapporteringsperiode} />
      </div>

      <div className={styles.navigasjonKontainer}>
        <RemixLink
          to="/rapportering"
          as="Button"
          variant="secondary"
          icon={<ArrowLeftIcon fontSize="1.5rem" />}
        >
          Forrige steg
        </RemixLink>
        <RemixLink
          to=""
          as="Button"
          variant="primary"
          icon={<ArrowRightIcon fontSize="1.5rem" />}
          iconPosition="right"
          disabled
        >
          Send til nav
        </RemixLink>
      </div>
    </>
  );
}
