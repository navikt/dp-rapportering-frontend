import { Left, Right } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { AktivitetOppsummering } from "~/components/AktivitetOppsummering/AktivitetOppsummering";
import { RemixLink } from "~/components/RemixLink";
import { Kalender } from "~/components/kalender/Kalender";
// import { lagreAktivitet } from "~/models/aktivitet.server";
import { validerSkjema } from "~/utils/validering.util";
import styles from "./rapportering.module.css";
import { lagreAktivitet } from "~/models/aktivitet.server";

export function meta() {
  return [
    {
      title: "Dagpenger rapportering",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

export async function action({ request }: ActionArgs) {
  const inputVerdier = await validerSkjema.validate(await request.formData());

  if (inputVerdier.error) {
    return validationError(inputVerdier.error);
  }

  const { type, dato, timer } = inputVerdier.submittedData;

  const aktivitet = {
    type,
    dato,
    timer: timer.replace(/,/g, "."), // Backend tar imot punktum
  };

  await lagreAktivitet(aktivitet);

  return inputVerdier;
}

export default function Rapportering() {
  return (
    <>
      <Heading level="2" size="large" spacing>
        Utfylling
      </Heading>
      <Kalender />

      <div className={styles.registertMeldeperiodeKontainer}>
        <p>Sammenlagt for meldeperioden:</p>
        <AktivitetOppsummering />
      </div>
      <div className={styles.navigasjonKontainer}>
        <RemixLink to="" as="Button" variant="secondary" icon={<Left />}>
          Mine side
        </RemixLink>
        <RemixLink
          to="/rapportering/send-inn"
          as="Button"
          variant="primary"
          icon={<Right />}
          iconPosition="right"
        >
          Neste steg
        </RemixLink>
      </div>
    </>
  );
}
