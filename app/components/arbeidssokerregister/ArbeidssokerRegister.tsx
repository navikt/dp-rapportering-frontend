import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useFetcher } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";

export function ArbeidssokerRegister() {
  const { getAppText } = useSanity();
  const fetcher = useFetcher<{ erRegistrertSomArbeidssoker: boolean }>();

  const handleChange = (erRegistrertSomArbeidssoker: boolean) => {
    fetcher.submit({ erRegistrertSomArbeidssoker }, { method: "post" });
  };

  return (
    <div className="my-8">
      <fetcher.Form method="post">
        <RadioGroup
          size="small"
          legend={getAppText("rapportering-arbeidssokerregister-tittel")}
          description={getAppText("rapportering-arbeidssokerregister-subtittel")}
          onChange={handleChange}
        >
          <Radio name="erRegistrertSomArbeidssoker" value="true">
            {getAppText("rapportering-arbeidssokerregister-svar-ja")}
          </Radio>
          <Radio name="erRegistrertSomArbeidssoker" value="false">
            {getAppText("rapportering-arbeidssokerregister-svar-nei")}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.erRegistrertSomArbeidssoker !== undefined &&
        (fetcher.data.erRegistrertSomArbeidssoker ? (
          <RegistertSomArbeidssoker />
        ) : (
          <AvregistertSomArbeidssoker />
        ))}
    </div>
  );
}

export function RegistertSomArbeidssoker() {
  const { getAppText } = useSanity();
  return (
    <Alert size="small" variant="info" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert")}
      </Heading>
    </Alert>
  );
}

export function AvregistertSomArbeidssoker() {
  const { getAppText, getRichText } = useSanity();
  return (
    <Alert size="small" variant="warning" className="my-6">
      <Heading spacing size="xsmall">
        {getAppText("rapportering-arbeidssokerregister-alert-tittel-registrert")}
      </Heading>
      <PortableText
        value={getRichText("rapportering-arbeidssokerregister-alert-innhold-avregistrert")}
      />
    </Alert>
  );
}
