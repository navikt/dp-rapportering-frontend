import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { useSanity } from "~/hooks/useSanity";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { KortType } from "~/utils/types";

interface IProps {
  periode: IRapporteringsperiode;
}

export function ArbeidssokerAlert({ periode }: IProps) {
  if (
    periode.type === KortType.MANUELL_ARENA ||
    periode.type === KortType.ETTERREGISTRERT
  ) {
    return null;
  }

  if (periode.registrertArbeidssoker === true) {
    return <RegistertArbeidssokerAlert />;
  }

  if (periode.registrertArbeidssoker === false) {
    return <AvregistertArbeidssokerAlert />;
  }

  return null;
}

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
    <Alert role="status" variant="warning" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert")}
      </Heading>
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
      />
    </Alert>
  );
}
