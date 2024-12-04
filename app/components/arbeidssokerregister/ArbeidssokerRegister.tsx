import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { useSanity } from "~/hooks/useSanity";

export function RegistertArbeidssokerAlert() {
  const { getAppText } = useSanity();

  return (
    <Alert variant="info" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert")}
      </Heading>
    </Alert>
  );
}

export function AvregistertArbeidssokerAlert() {
  const { getAppText, getRichText } = useSanity();

  return (
    <Alert variant="warning" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert")}
      </Heading>
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
      />
    </Alert>
  );
}
