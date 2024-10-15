import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useFetcher } from "@remix-run/react";
import { INetworkResponse } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { Error } from "../error/Error";

export function ArbeidssokerRegisterering({
  rapporteringsperiodeId,
  registrertArbeidssoker,
}: {
  rapporteringsperiodeId: string;
  registrertArbeidssoker: boolean | null;
}) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher<INetworkResponse>();

  const handleChange = (registrertArbeidssokerSvar: boolean) => {
    fetcher.submit(
      {
        registrertArbeidssoker: registrertArbeidssokerSvar,
        rapporteringsperiodeId,
      },
      { method: "post" }
    );
  };

  return (
    <>
      <fetcher.Form method="post">
        <RadioGroup
          legend={getAppText("rapportering-arbeidssokerregister-tittel")}
          description={getAppText("rapportering-arbeidssokerregister-subtittel")}
          onChange={handleChange}
          value={registrertArbeidssoker}
        >
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={true}
            checked={registrertArbeidssoker === true}
          >
            {getAppText("rapportering-arbeidssokerregister-svar-ja")}
          </Radio>
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={false}
            checked={registrertArbeidssoker === false}
          >
            {getAppText("rapportering-arbeidssokerregister-svar-nei")}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.status === "error" && (
        <Error title={getAppText(fetcher.data.error.statusText)} />
      )}

      {registrertArbeidssoker !== null &&
        (registrertArbeidssoker ? (
          <RegistertArbeidssokerAlert />
        ) : (
          <AvregistertArbeidssokerAlert />
        ))}
    </>
  );
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
