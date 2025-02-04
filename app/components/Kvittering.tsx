import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { RemixLink } from "~/components/RemixLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useUXSignals } from "~/hooks/useUXSignals";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import styles from "../styles/kvittering.module.css";
import {
  AvregistertArbeidssokerAlert,
  RegistertArbeidssokerAlert,
} from "./arbeidssokerregister/ArbeidssokerRegister";
import { NavigasjonContainer } from "./navigasjon-container/NavigasjonContainer";

interface Ikvittering {
  tittel: string;
  periode: IRapporteringsperiode;
  harNestePeriode: boolean;
}

export function Kvittering({ tittel, periode, harNestePeriode }: Ikvittering) {
  const { getAppText, getLink } = useSanity();
  const { locale } = useLocale();
  const { trackNavigere } = useAnalytics();

  if (typeof window !== "undefined" && window["hj"]) {
    window.hj("trigger", "nyttmeldekortDP");
  }

  useUXSignals(true);

  return (
    <>
      <Alert variant="success" className="my-4">
        <Heading spacing size="small" level="3">
          {tittel}
        </Heading>
      </Alert>

      <Accordion headingSize="medium">
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

            <div className={styles.skrivUtKnappen}>
              <Button
                variant="tertiary"
                icon={<PrinterSmallFillIcon aria-hidden />}
                onClick={() => window.print()}
              >
                {getAppText("rapportering-skriv-ut")}
              </Button>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <div data-uxsignals-embed="panel-ppugndwzu6" style={{ margin: "var(--a-spacing-8) auto" }} />

      <NavigasjonContainer>
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

      <NavigasjonContainer>
        <RemixLink
          as="Link"
          to={getLink("rapportering-se-og-endre").linkUrl}
          onClick={() => {
            const linkId = "rapportering-se-og-endre";
            trackNavigere({
              lenketekst: getLink(linkId).linkText,
              destinasjon: getLink(linkId).linkUrl,
              linkId,
            });
          }}
        >
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </NavigasjonContainer>
    </>
  );
}
