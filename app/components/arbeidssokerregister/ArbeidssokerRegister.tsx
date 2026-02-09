import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { useSanity } from "~/hooks/useSanity";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { nestePeriode, skalHaArbeidssokerSporsmal } from "~/utils/periode.utils";

interface IProps {
  periode: IRapporteringsperiode;
}

export function ArbeidssokerAlert({ periode }: IProps) {
  if (!skalHaArbeidssokerSporsmal(periode)) {
    return null;
  }

  if (periode.registrertArbeidssoker === true) {
    return <RegistertArbeidssokerAlert />;
  }

  if (periode.registrertArbeidssoker === false) {
    return <AvregistertArbeidssokerAlert periode={periode} />;
  }

  return null;
}

export function RegistertArbeidssokerAlert() {
  const { getAppText } = useSanity();

  return (
    <Alert variant="info" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert-v2")}
      </Heading>
    </Alert>
  );
}

export function AvregistertArbeidssokerAlert({ periode }: IProps) {
  const { getAppText, getRichText } = useSanity();

  const nesteMeldeperiode = nestePeriode(periode.periode, "dd.MM.yyyy");

  return (
    <Alert role="status" variant="warning" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-avregistrert")}
      </Heading>
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert-v2", {
          dato: nesteMeldeperiode.fraOgMed,
        })}
      />
    </Alert>
  );
}
