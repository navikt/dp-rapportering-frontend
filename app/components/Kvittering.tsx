import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useUXSignals } from "~/hooks/useUXSignals";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import styles from "../styles/kvittering.module.css";
import { ArbeidssokerAlert } from "./arbeidssokerregister/ArbeidssokerRegister";
import { NavigasjonContainer } from "./navigasjon-container/NavigasjonContainer";

interface Ikvittering {
  tittel: string;
  periode: IRapporteringsperiode;
  harNestePeriode: boolean;
}

export function Kvittering({ tittel, periode, harNestePeriode }: Ikvittering) {
  const { getAppText, getLink, getRichText } = useSanity();
  const { locale } = useLocale();
  const { trackNavigere } = useAnalytics();

  useUXSignals(true);

  return (
    <>
      <Alert variant="success" role="status" className="my-4">
        <Heading spacing size="small" level="3">
          {tittel}
        </Heading>
      </Alert>

      <Alert variant="info" className="my-4 alert-with-rich-text">
        <PortableText value={getRichText("rapportering-periode-kvittering-info")} />
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

            <ArbeidssokerAlert periode={periode} />

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
          <ReactLink
            as="Button"
            to={getLink("rapportering-ga-til-neste-meldekort").linkUrl}
            className={navigasjonStyles.knapp}
          >
            {getLink("rapportering-ga-til-neste-meldekort").linkText}
          </ReactLink>
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
        <ReactLink
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
        </ReactLink>
      </NavigasjonContainer>
    </>
  );
}
