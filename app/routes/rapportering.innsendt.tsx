import { Heading } from "@navikt/ds-react";
import { RemixLink } from "~/components/RemixLink";

export default function RapporteringSendt() {
  return (
    <>
      <Heading level="2" size="small">
        Rapporteringen din er sendt inn til NAV.
      </Heading>
      <br />
      <RemixLink
        to=""
        onClick={() => window.location.assign("https://www.nav.no/minside")}
        as="Button"
        variant="primary"
      >
        Gå til Mine side
      </RemixLink>
    </>
  );
}
