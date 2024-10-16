import { Alert, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useFetcher } from "@remix-run/react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { kanSendes } from "~/utils/periode.utils";
import { INetworkResponse } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { Error } from "../error/Error";

export function ArbeidssokerRegisterering({ periode }: { periode: IRapporteringsperiode }) {
  const { getAppText } = useSanity();
  const fetcher = useFetcher<INetworkResponse>();

  const handleChange = (registrertArbeidssokerSvar: boolean) => {
    if (kanSendes(periode)) {
      fetcher.submit(
        {
          registrertArbeidssoker: registrertArbeidssokerSvar,
          rapporteringsperiodeId: periode.id,
        },
        { method: "post" }
      );
    }
  };

  return (
    <>
      <fetcher.Form method="post">
        <RadioGroup
          disabled={!kanSendes(periode)}
          legend={getAppText("rapportering-arbeidssokerregister-tittel")}
          description={getAppText("rapportering-arbeidssokerregister-subtittel")}
          onChange={handleChange}
          value={periode.registrertArbeidssoker}
        >
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={true}
            checked={periode.registrertArbeidssoker === true}
          >
            {getAppText("rapportering-arbeidssokerregister-svar-ja")}
          </Radio>
          <Radio
            name="erRegistrertSomArbeidssoker"
            value={false}
            checked={periode.registrertArbeidssoker === false}
          >
            {getAppText("rapportering-arbeidssokerregister-svar-nei")}
          </Radio>
        </RadioGroup>
      </fetcher.Form>

      {fetcher.data?.status === "error" && (
        <Error title={getAppText(fetcher.data.error.statusText)} />
      )}

      {periode.registrertArbeidssoker !== null &&
        (periode.registrertArbeidssoker ? (
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
