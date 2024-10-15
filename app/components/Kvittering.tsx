import {
  AvregistertArbeidssokerAlert,
  RegistertArbeidssokerAlert,
} from "./arbeidssokerregister/ArbeidssokerRegister";
import { Accordion, Alert, Button, Heading } from "@navikt/ds-react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { Kalender } from "~/components/kalender/Kalender";

interface Ikvittering {
  tittel: string;
  periode: IRapporteringsperiode;
  harNestePeriode: boolean;
}

export function Kvittering({ tittel, periode, harNestePeriode }: Ikvittering) {
  const { getAppText, getLink } = useSanity();
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
          <Accordion.Content>
            <div className="oppsummering">
              <Kalender rapporteringsperiode={periode} aapneModal={() => {}} readonly />
              <AktivitetOppsummering rapporteringsperiode={periode} />
              {periode.registrertArbeidssoker ? (
                <RegistertArbeidssokerAlert />
              ) : (
                <AvregistertArbeidssokerAlert />
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <div className="navigasjon-container">
        {harNestePeriode ? (
          <RemixLink
            as="Button"
            to={getLink("ga-til-neste-meldekort").linkUrl}
            className="py-4 px-8"
          >
            {getLink("ga-til-neste-meldekort").linkText}
          </RemixLink>
        ) : (
          <Button as="a" className="px-16" href={getLink("ga-til-mine-dagpenger").linkUrl}>
            {getLink("ga-til-mine-dagpenger").linkText}
          </Button>
        )}
      </div>

      <div className="navigasjon-container">
        <RemixLink as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </div>
    </>
  );
}
