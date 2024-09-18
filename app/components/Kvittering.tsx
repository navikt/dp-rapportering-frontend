import { Accordion, Alert, Heading } from "@navikt/ds-react";
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
    <div>
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
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
      <div className="navigasjon-container">
        <RemixLink
          as="Button"
          to={getLink("rapportering-periode-bekreftelse-tilbake").linkUrl}
          className="py-4 px-8"
        >
          {harNestePeriode
            ? getLink("rapportering-periode-bekreftelse-neste").linkText
            : getLink("rapportering-periode-bekreftelse-tilbake").linkText}
        </RemixLink>
      </div>
    </div>
  );
}
