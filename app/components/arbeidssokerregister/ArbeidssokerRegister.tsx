import { Alert, BodyLong, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { useFetcher } from "@remix-run/react";

export function ArbeidssokerRegister() {
  const fetcher = useFetcher<{ erRegistrertSomArbeidssoker: boolean }>();

  const handleChange = (erRegistrertSomArbeidssoker: boolean) => {
    fetcher.submit({ erRegistrertSomArbeidssoker }, { method: "post" });
  };

  return (
    <div className="rapportering-container">
      <fetcher.Form method="post">
        <RadioGroup
          size="small"
          legend="Ønsker du fortsatt å være registrert som arbeidssøker de neste 14 dagene?"
          description="Du må være registrert for å få utbetalinger og oppfølging fra Nav"
          onChange={handleChange}
        >
          <Radio name="erRegistrertSomArbeidssoker" value="true">
            Ja
          </Radio>
          <Radio name="erRegistrertSomArbeidssoker" value="false">
            Nei
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.erRegistrertSomArbeidssoker !== undefined && (
        <ArbeidssokerRegisterAlert registrert={fetcher.data.erRegistrertSomArbeidssoker} />
      )}
    </div>
  );
}

function ArbeidssokerRegisterAlert({ registrert }: { registrert: boolean }) {
  const alert = registrert
    ? {
        variant: "info" as const,
        heading: "Du vil fortsatt være registrert som arbeidssøker de neste 14 dagene",
        message: "",
      }
    : {
        variant: "warning" as const,
        heading: "Du vil bli avregistrert som arbeidssøker",
        message:
          "Du har svart Nei til å være registrert som arbeidssøker de neste 14 dagene. Du vil ikke lenger få utbetalt dagpenger eller oppfølging fra NAV.",
      };

  return (
    <Alert size="small" variant={alert.variant} className="my-6">
      <Heading spacing size="xsmall">
        {alert.heading}
      </Heading>
      <BodyLong size="small">{alert.message}</BodyLong>
    </Alert>
  );
}
