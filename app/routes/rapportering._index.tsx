import { Left, Right } from "@navikt/ds-icons";
import { Heading } from "@navikt/ds-react";
import { ActionArgs } from "@remix-run/node";
import { RemixLink } from "~/components/RemixLink";
import { Kalender } from "~/components/kalender/Kalender";
import { RegistertMeldeperiode } from "~/components/registrert-meldeperiode/RegistertMeldeperiode";
import styles from "./rapportering.module.css";
import { IAktivitet, TAktivitetType, lagreAktivitet } from "~/models/aktivitet.server";
import invariant from "tiny-invariant";

export function meta() {
  return [
    {
      title: "Dagpenger rapportering",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

function validerInput(input: FormDataEntryValue) {
  if (typeof input !== "string") {
    throw new Error("input er ikke en string");
  }

  return true;
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const type = formData.get("type");
  const dato = formData.get("dato");
  const timer = formData.get("timer");

  invariant(type, "Type finnes ikke");
  invariant(dato, "Dato finnes ikke");
  invariant(timer, "Timer finnes ikke");

  validerInput(type);
  validerInput(dato);
  validerInput(timer);

  const aktivitet: IAktivitet = {
    type: type as TAktivitetType,
    timer: timer as string,
    dato: dato as string,
  };

  const response = lagreAktivitet(aktivitet);

  return response;
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
        <RegistertMeldeperiode />
      </div>
      <div className={styles.navigasjonKontainer}>
        <RemixLink to="" as="Button" variant="secondary" icon={<Left />}>
          Mine side
        </RemixLink>
        <RemixLink
          to="send-inn"
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
