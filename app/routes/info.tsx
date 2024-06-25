import { Accordion, BodyLong, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useNavigate } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";

export default function Infoside() {
  const navigate = useNavigate();
  const { getAppText, getRichText } = useSanity();

  const tilbake = () => navigate(-1);

  return (
    <>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading level="1" size="xlarge">
            {getAppText("rapportering-info-tittel")}
          </Heading>
        </div>
      </div>
      <div className="rapportering-container">
        <Heading tabIndex={-1} className="vo-fokus" size="medium" level="2">
          {getAppText("rapportering-info-beskrivelse-tittel")}
        </Heading>
        <BodyLong spacing>{getAppText("rapportering-info-beskrivelse")}</BodyLong>

        <Accordion>
          <Accordion.Item>
            <Accordion.Header>
              {getAppText("rapportering-info-kapittel-arbeid-tittel")}
            </Accordion.Header>
            <Accordion.Content>
              <PortableText value={getRichText("rapportering-info-kapittel-arbeid-innhold")} />
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              {getAppText("rapportering-info-kapittel-tiltak-tittel")}
            </Accordion.Header>
            <Accordion.Content>
              <PortableText value={getRichText("rapportering-info-kapittel-tiltak-innhold")} />
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              {getAppText("rapportering-info-kapittel-sykdom-tittel")}
            </Accordion.Header>
            <Accordion.Content>
              <PortableText value={getRichText("rapportering-info-kapittel-sykdom-innhold")} />
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>
              {getAppText("rapportering-info-kapittel-fravaer-tittel")}
            </Accordion.Header>
            <Accordion.Content>
              <PortableText value={getRichText("rapportering-info-kapittel-fravaer-innhold")} />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <div className="navigasjon-container">
          <RemixLink as="Button" to="" onClick={tilbake} variant="primary">
            {getAppText("rapportering-info-knapp-tilbake")}
          </RemixLink>
        </div>
      </div>
    </>
  );
}
