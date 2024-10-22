import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Checkbox, CheckboxGroup, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { isRouteErrorResponse, useFetcher, useLoaderData, useRouteError } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getSession } from "~/models/getSession.server";
import { getInfoAlertStatus } from "~/models/info.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { getSanityPortableTextComponents } from "~/sanity/sanityPortableTextComponents";
import type { action as StartAction } from "./api.start";
import { formaterDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { RemixLink } from "~/components/RemixLink";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);
    const session = await getSession(request);
    const showInfoAlert = (await getInfoAlertStatus(request)) as boolean;

    return json({ rapporteringsperioder, session, showInfoAlert });
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("rapportering-feilmelding-henting-av-perioder", { status: 500 });
  }
}

export default function Landingsside() {
  // TODO: Sjekk om bruker har rapporteringsperioder eller ikke
  const { rapporteringsperioder, showInfoAlert } = useLoaderData<typeof loader>();

  const { getAppText, getLink, getRichText } = useSanity();
  const startFetcher = useFetcher<typeof StartAction>();
  const showInfoAlertFetcher = useFetcher();

  const [samtykker, setSamtykker] = useState(showInfoAlert);

  const forstePeriode = rapporteringsperioder[0];

  useEffect(() => {
    setBreadcrumbs([], getAppText);
  }, [getAppText]);

  function startUtfylling() {
    startFetcher.submit(
      { rapporteringsperiodeId: forstePeriode.id },
      { method: "post", action: "/api/start" }
    );
  }

  return (
    <>
      {showInfoAlert ?? (
        <Alert
          closeButton
          onClose={() => {
            showInfoAlertFetcher.submit(
              { infoAlertStatus: false },
              { method: "post", action: "/api/infoalert" }
            );
          }}
          variant="info"
          className="my-8 alert-with-rich-text"
        >
          <Heading spacing size="small" level="3">
            {getAppText("rapportering-informasjon-nytt-meldekort-tittel")}
          </Heading>
          <PortableText value={getRichText("rapportering-informasjon-nytt-meldekort")} />
        </Alert>
      )}

      {rapporteringsperioder.length === 0 && (
        <Alert variant="info" className="my-8 alert-with-rich-text">
          <PortableText value={getRichText("rapportering-ingen-meldekort")} />
        </Alert>
      )}

      {forstePeriode?.kanSendes === false && (
        <Alert variant="info" className="my-8 alert-with-rich-text">
          <PortableText
            components={getSanityPortableTextComponents({
              dato: formaterDato(new Date(forstePeriode.kanSendesFra)),
              "fra-og-til-uke": formaterPeriodeTilUkenummer(
                forstePeriode.periode.fraOgMed,
                forstePeriode.periode.tilOgMed
              ),
            })}
            value={getRichText("rapportering-for-tidlig-a-sende-meldekort")}
          />
        </Alert>
      )}
      <PortableText value={getRichText("rapportering-innledning")} />

      {forstePeriode?.kanSendes === true && (
        <>
          <Heading size="small" level="2" className="mt-8">
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

          <div className="navigasjon-container">
            <Button
              size="medium"
              className="navigasjonsknapp"
              icon={<ArrowRightIcon aria-hidden />}
              iconPosition="right"
              onClick={startUtfylling}
              disabled={!samtykker}
            >
              {getAppText("rapportering-knapp-neste")}
            </Button>
          </div>
        </>
      )}

      <div className="navigasjon-container">
        <RemixLink as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  const { env } = useTypedRouteLoaderData("root");

  if (isRouteErrorResponse(error)) {
    if (env.IS_LOCALHOST && error.status === 440) {
      return (
        <DevelopmentContainer>
          <>
            Sesjonen er utløpt! &nbsp;
            <a
              target="_blank"
              rel="noreferrer"
              href="https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
            >
              Klikk på lenken for å hente ny token
            </a>
          </>
        </DevelopmentContainer>
      );
    }

    return <GeneralErrorBoundary error={error} />;
  }
}
