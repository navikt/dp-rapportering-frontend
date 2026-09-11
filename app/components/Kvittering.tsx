import { PrinterSmallFillIcon } from "@navikt/aksel-icons";
import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";
import { PortableTextRenderer } from "~/components/portable-text/PortableTextRenderer";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useLocale } from "~/hooks/useLocale";
import { useSanity } from "~/hooks/useSanity";
import { useUXSignals } from "~/hooks/useUXSignals";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import styles from "~/styles/kvittering.module.css";
import rootStyles from "~/styles/root.module.css";

import { ArbeidssokerstatusBeskjed } from "./arbeidssokerstatus/ArbeidssokerstatusBeskjed";

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

      <Accordion data-color="neutral">
        <Accordion.Item>
          <Accordion.Header className={styles.kvitteringTittel}>
            <Heading level="3" size="medium">
              {getAppText("rapportering-periode-bekreftelse-oppsummering-tittel")}
            </Heading>
          </Accordion.Header>
          <Accordion.Content className={styles.kvitteringInnhold}>
            <div className="oppsummering">
              <Kalender periode={periode} aapneModal={() => {}} locale={locale} readonly />
              <AktivitetOppsummering periode={periode} />
            </div>
            <ArbeidssokerstatusBeskjed periode={periode} side="bekreftelse" />
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
        <Accordion.Item>
          <Accordion.Header>
            <Heading level="3" size="medium">
              {getAppText("rapportering-periode-kvittering-info-tittel")}
            </Heading>
          </Accordion.Header>
          <Accordion.Content className="alert-with-rich-text">
            <PortableTextRenderer value={getRichText("rapportering-periode-kvittering-info")} />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <div data-uxsignals-embed="panel-ppugndwzu6" style={{ margin: "var(--ax-space-32) auto" }} />

      <div className={rootStyles.buttonsContainerRow}>
        {harNestePeriode ? (
          <ReactLink as="Button" to={getLink("rapportering-ga-til-neste-meldekort").linkUrl}>
            {getLink("rapportering-ga-til-neste-meldekort").linkText}
          </ReactLink>
        ) : (
          <Button as="a" href={getLink("rapportering-ga-til-mine-dagpenger").linkUrl}>
            {getLink("rapportering-ga-til-mine-dagpenger").linkText}
          </Button>
        )}
      </div>

      <div className={rootStyles.buttonsContainerRow}>
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
      </div>
    </>
  );
}
