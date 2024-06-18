import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useFetcher } from "@remix-run/react";
import { ArbeidssokerSvar } from "~/models/arbeidssoker.server";
import { useSanity } from "~/hooks/useSanity";

export function ArbeidssokerRegister({
  rapporteringsperiodeId,
  registrertArbeidssoker,
}: {
  rapporteringsperiodeId: string;
  registrertArbeidssoker: boolean | null;
}) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher<ArbeidssokerSvar>();

  const handleChange = (registrertArbeidssoker: boolean) => {
    fetcher.submit({ registrertArbeidssoker, rapporteringsperiodeId }, { method: "post" });
  };

  return (
    <div className="my-8">
      <fetcher.Form method="post">
        <RadioGroup
          size="small"
          legend={getAppText("rapportering-arbeidssokerregister-tittel")}
          description={getAppText("rapportering-arbeidssokerregister-subtittel")}
          onChange={handleChange}
          value={String(registrertArbeidssoker)}
        >
          <Radio name="erRegistrertSomArbeidssoker" value="true">
            {getAppText("rapportering-arbeidssokerregister-svar-ja")}
          </Radio>
          <Radio name="erRegistrertSomArbeidssoker" value="false">
            {getAppText("rapportering-arbeidssokerregister-svar-nei")}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {registrertArbeidssoker !== null &&
        (registrertArbeidssoker ? <RegistertSomArbeidssoker /> : <AvregistertSomArbeidssoker />)}
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
