import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { INetworkResponse } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";

export function ArbeidssokerRegister({
  rapporteringsperiodeId,
  registrertArbeidssoker: initialRegistrertArbeidssoker,
}: {
  rapporteringsperiodeId: string;
  registrertArbeidssoker: boolean | null;
}) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher<INetworkResponse>();
  const [registrertArbeidssoker, setRegistrertArbeidssoker] = useState(
    initialRegistrertArbeidssoker
  );

  const handleChange = (registrertArbeidssokerSvar: boolean) => {
    setRegistrertArbeidssoker(registrertArbeidssokerSvar);
    fetcher.submit(
      { registrertArbeidssoker: registrertArbeidssokerSvar, rapporteringsperiodeId },
      { method: "post" }
    );
  };

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (fetcher.data?.status === "error") {
      timeout = setTimeout(() => {
        setRegistrertArbeidssoker(false);
      }, 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [fetcher.data?.status, fetcher.data, initialRegistrertArbeidssoker, registrertArbeidssoker]);

  return (
    <div>
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

      {registrertArbeidssoker !== null &&
        (registrertArbeidssoker ? (
          <RegistertArbeidssokerAlert />
        ) : (
          <AvregistertArbeidssokerAlert />
        ))}
    </div>
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
