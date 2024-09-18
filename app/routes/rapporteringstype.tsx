import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, Radio, RadioGroup } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { hentRapporteringstype, settRapporteringstype } from "~/models/rapporteringstype.server";
import type { action as StartAction } from "./api.start";
import { hentForstePeriodeTekst } from "~/utils/periode.utils";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringstype = await hentRapporteringstype(request);
    const rapporteringsperioder = await hentRapporteringsperioder(request);

    return json({ rapporteringstype, rapporteringsperioder });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const formData = await request.formData();

  const rapporteringstype = formData.get("rapporteringstype") as Rapporteringstype;

  return json(
    { status: "success" },
    {
      headers: {
        "Set-Cookie": await settRapporteringstype(cookieHeader, rapporteringstype),
      },
    }
  );
}

export default function RapporteringstypeSide() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { rapporteringsperioder, rapporteringstype } = useLoaderData<typeof loader>();

  const { getAppText, getLink, getRichText } = useSanity();

  const startFetcher = useFetcher<typeof StartAction>();
  const rapporteringstypeFetcher = useFetcher<typeof action>();

  const [type, setType] = useState<Rapporteringstype>(
    rapporteringstype || Rapporteringstype.harAktivitet
  );

  const antallPerioder = rapporteringsperioder.length;
  const harFlerePerioder = antallPerioder > 1;
  const forstePeriode = rapporteringsperioder[0];

  const rapporteringstypeFormLabel =
    rapporteringsperioder.length === 1
      ? getAppText("rapportering-rapporter-navarende-tittel")
      : getAppText("rapportering-ikke-utfylte-rapporter-tittel");

  const nesteKnappTekst =
    rapporteringstype === Rapporteringstype.harIngenAktivitet
      ? getAppText("rapportering-neste")
      : getAppText("rapportering-til-utfylling");

  function startUtfylling() {
    startFetcher.submit(
      { rapporteringsperiodeId: forstePeriode.id, rapporteringstype: type },
      { method: "post", action: "/api/start" }
    );
  }

  function endreRapporteringstype(valgtType: Rapporteringstype): void {
    setType(valgtType);
  }

  useEffect(() => {
    if (type) {
      rapporteringstypeFetcher.submit({ rapporteringstype: type }, { method: "post" });
    }
    // Hvis du inkluderer rapporteringstypeFetcher i dep. array får du en uendelig løkke
  }, [type]);

  return (
    <>
      {harFlerePerioder && (
        <>
          <Alert variant="warning" className="my-8">
            <Heading spacing size="small" level="2">
              {getAppText("rapportering-flere-perioder-tittel").replace(
                "{antall}",
                antallPerioder.toString()
              )}
            </Heading>
            {getAppText("rapportering-flere-perioder-innledning")}
          </Alert>

          <Heading spacing size="small" level="2">
            {getAppText("rapportering-forste-periode")}
          </Heading>
          <p></p>
        </>
      )}

      <RadioGroup
        legend={rapporteringstypeFormLabel}
        description={hentForstePeriodeTekst(forstePeriode, getAppText)}
        onChange={endreRapporteringstype}
        value={type}
      >
        <Radio value={Rapporteringstype.harAktivitet}>
          {getAppText("rapportering-noe-å-rapportere")}
        </Radio>
        <Radio
          data-testid="rapportering-ingen-å-rapportere"
          className="rapportering-ingen-å-rapportere"
          value={Rapporteringstype.harIngenAktivitet}
        >
          <PortableText value={getRichText("rapportering-ingen-å-rapportere")} />
        </Radio>
      </RadioGroup>

      <Center>
        <Button
          size="medium"
          className="my-18 py4 px-16"
          icon={<ArrowRightIcon aria-hidden />}
          iconPosition="right"
          onClick={startUtfylling}
        >
          {nesteKnappTekst}
        </Button>
      </Center>

      <Center>
        <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </Center>
    </>
  );
}
