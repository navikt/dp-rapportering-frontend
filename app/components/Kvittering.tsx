import {
  AvregistertArbeidssokerAlert,
  RegistertArbeidssokerAlert,
} from "./arbeidssokerregister/ArbeidssokerRegister";
import { hentSkjermleserDatoTekst } from "./kalender/kalender.utils";
import { NavigasjonContainer } from "./navigasjon-container/NavigasjonContainer";
import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";
import classNames from "classnames";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useUXSignals } from "~/hooks/useUXSignals";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import styles from "../styles/kvittering.module.css";

interface Ikvittering {
  tittel: string;
  periode: IRapporteringsperiode;
  harNestePeriode: boolean;
}

export function Kvittering({ tittel, periode, harNestePeriode }: Ikvittering) {
  const { getAppText, getLink } = useSanity();
  const { locale } = useLocale();

  if (typeof window !== "undefined" && window["hj"]) {
    window.hj("trigger", "nyttmeldekortDP");
  }

  console.log(periode);

  useUXSignals(true);

  return (
    <>
      <Alert variant="success" className={classNames("my-4", styles.screenOnly)}>
        <Heading spacing size="small" level="3">
          {tittel}
        </Heading>
      </Alert>

      <Accordion headingSize="medium" className={styles.screenOnly}>
        <Accordion.Item>
          <Accordion.Header>
            {getAppText("rapportering-periode-bekreftelse-oppsummering-tittel")}
          </Accordion.Header>
          <Accordion.Content className={styles.kvitteringInnhold}>
            <div className="oppsummering">
              <Kalender periode={periode} aapneModal={() => {}} locale={locale} readonly />
              <AktivitetOppsummering periode={periode} />
            </div>

            {periode.registrertArbeidssoker ? (
              <RegistertArbeidssokerAlert />
            ) : (
              <AvregistertArbeidssokerAlert />
            )}
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

      <div
        className={styles.screenOnly}
        data-uxsignals-embed="panel-ppugndwzu6"
        style={{ margin: "var(--a-spacing-8) auto" }}
      />

      {/* TODO
       * Lista over dager må ha en tittel med uker og dato
       * Arbeidssøkerstatus må vises {periode.registrertArbeidssoker (true | false)}
       * {periode.registrertArbeidssoker ? (
              <RegistertArbeidssokerAlert />
            ) : (
              <AvregistertArbeidssokerAlert />
            )}
       * De første 7 dagene i lista har ukenummer og fra- og til-dato som tittel periode.dager[0-6].dato
         import { getISOWeek } from "date-fns";
         getISOWeek(new Date(dato))
       * De siste 7 dagene i lista har ukenummer og fra- og til-dato som tittel periode.dager[7-13].dato
       */}

      <div className={styles.printOnly}>
        <ul>
          {periode.dager.map((dag) => {
            return <li key={dag.dato}>{hentSkjermleserDatoTekst(dag, getAppText, locale)}</li>;
          })}
        </ul>
      </div>

      <NavigasjonContainer className={styles.screenOnly}>
        {harNestePeriode ? (
          <RemixLink
            as="Button"
            to={getLink("rapportering-ga-til-neste-meldekort").linkUrl}
            className={navigasjonStyles.knapp}
          >
            {getLink("rapportering-ga-til-neste-meldekort").linkText}
          </RemixLink>
        ) : (
          <Button
            as="a"
            className={navigasjonStyles.knapp}
            href={getLink("rapportering-ga-til-mine-dagpenger").linkUrl}
          >
            {getLink("rapportering-ga-til-mine-dagpenger").linkText}
          </Button>
        )}
      </NavigasjonContainer>

      <NavigasjonContainer className={styles.screenOnly}>
        <RemixLink as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </NavigasjonContainer>
    </>
  );
}
