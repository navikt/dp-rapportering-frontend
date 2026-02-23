import { Alert } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { useSanity } from "~/hooks/useSanity";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterDato } from "~/utils/dato.utils";
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
  const { getRichText } = useSanity();

  return (
    <Alert variant="info" className="my-6 alert-with-rich-text">
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-registrert-v2")}
      />
    </Alert>
  );
}

export function AvregistertArbeidssokerAlert({ periode }: IProps) {
  const { getRichText } = useSanity();

  const nesteMeldeperiode = nestePeriode(periode.periode);

  return (
    <Alert role="status" variant="warning" className="my-6 alert-with-rich-text">
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert-v2", {
          dato: formaterDato({ dato: nesteMeldeperiode.fraOgMed, dateFormat: "d. MMMM yyyy" }),
        })}
      />
    </Alert>
  );
}
