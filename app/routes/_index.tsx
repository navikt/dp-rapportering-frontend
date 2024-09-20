import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Checkbox, CheckboxGroup, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { getSession } from "~/models/getSession.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import type { action as StartAction } from "./api.start";
import { useSanity } from "~/hooks/useSanity";
import { LesMer } from "~/components/LesMer";
import { RemixLink } from "~/components/RemixLink";
import Center from "~/components/center/Center";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);
    const session = await getSession(request);

    return json({ rapporteringsperioder, session });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("Feil i uthenting av rapporteringsperioder", { status: 500 });
  }
}

export default function Landingsside() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { rapporteringsperioder } = useLoaderData<typeof loader>();

  const { getAppText, getLink, getRichText } = useSanity();
  const startFetcher = useFetcher<typeof StartAction>();

  const [samtykker, setSamtykker] = useState(false);

  const forstePeriode = rapporteringsperioder[0];

  function startUtfylling() {
    startFetcher.submit(
      { rapporteringsperiodeId: forstePeriode.id },
      { method: "post", action: "/api/start" }
    );
  }

  return (
    <>
      {rapporteringsperioder.length === 0 && (
        <Alert variant="info" className="my-8 alert-with-rich-text">
          <PortableText value={getRichText("rapportering-ingen-meldekort")} />
        </Alert>
      )}

      {forstePeriode?.kanSendes === false && (
        <Alert variant="info" className="my-8 alert-with-rich-text">
          <PortableText
            components={getSanityPortableTextComponents({
              dato: forstePeriode.kanSendesFra,
            })}
            value={getRichText("rapportering-for-tidlig-a-sende-meldekort")}
          />
        </Alert>
      )}

      <PortableText value={getRichText("rapportering-innledning")} />

      <LesMer />

      {forstePeriode?.kanSendes === true && (
        <>
          <Heading size="small" level="2">
            {getAppText("rapportering-samtykke-tittel")}
          </Heading>

          <PortableText value={getRichText("rapportering-samtykke-beskrivelse")} />

          <CheckboxGroup
            value={[samtykker]}
            legend=""
            hideLegend
            onChange={(value) => setSamtykker(value.includes(true))}
          >
            <Checkbox value={true}>{getAppText("rapportering-samtykke-checkbox")}</Checkbox>
          </CheckboxGroup>

          <Center>
            <Button
              size="medium"
              className="my-18 py4 px-16"
              icon={<ArrowRightIcon aria-hidden />}
              iconPosition="right"
              onClick={startUtfylling}
              disabled={!samtykker}
            >
              {getAppText("rapportering-neste")}
            </Button>
          </Center>
        </>
      )}

      <Center>
        <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </Center>
    </>
  );
}
