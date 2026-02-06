import { TZDate } from "@date-fns/tz";
import { ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, Button, Heading, ReadMore } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { useEffect } from "react";
import { LoaderFunctionArgs } from "react-router";
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useNavigation,
  useRouteError,
  useSearchParams,
} from "react-router";

import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";
import { NavigasjonContainer } from "~/components/navigasjon-container/NavigasjonContainer";
import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { getSession } from "~/models/getSession.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { formaterDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { FEILTYPE, TIDSSONER } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import type { action as StartAction } from "./api.start";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const rapporteringsperioder = await hentRapporteringsperioder(request);
    const session = await getSession(request);

    return { rapporteringsperioder, session };
  } catch (error: unknown) {
    if (error instanceof Response) {
      throw error;
    }

    throw new Response("rapportering-feilmelding-henting-av-perioder", { status: 500 });
  }
}

export default function Landingsside() {
  const { rapporteringsperioder } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const { getAppText, getLink, getRichText } = useSanity();
  const startFetcher = useFetcher<typeof StartAction>();
  const { trackSkjemaStartet, trackNavigere } = useAnalytics();

  const forstePeriode = rapporteringsperioder[0];
  const feilType = searchParams.get("feil");

  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);

  useEffect(() => {
    setBreadcrumbs([], getAppText);
  }, [getAppText]);

  function startUtfylling() {
    trackSkjemaStartet(forstePeriode.id);
    startFetcher.submit(
      { rapporteringsperiodeId: forstePeriode.id },
      { method: "post", action: "/api/start" },
    );
  }

  return (
    <>
      {feilType === FEILTYPE.ALLEREDE_INNSENDT && (
        <Alert variant="warning" className="my-4">
          Du prøvde å åpne et meldekort som allerede er sendt inn. Du kan ikke fylle ut dette
          meldekortet på nytt.
        </Alert>
      )}

      {feilType === FEILTYPE.KAN_IKKE_ENDRES && (
        <Alert variant="warning" className="my-4">
          Du prøvde å endre et meldekort som ikke lenger kan endres. Fristen for å endre dette
          meldekortet har gått ut.
        </Alert>
      )}

      {rapporteringsperioder.length === 0 && (
        <Alert variant="info" className="my-4 alert-with-rich-text">
          <PortableText value={getRichText("rapportering-ingen-meldekort")} />
        </Alert>
      )}

      {forstePeriode?.kanSendes === false && (
        <Alert variant="info" className="my-4 alert-with-rich-text">
          <PortableText
            value={getRichText("rapportering-for-tidlig-a-sende-meldekort", {
              dato: formaterDato({ dato: new TZDate(forstePeriode.kanSendesFra, TIDSSONER.OSLO) }),
              "fra-og-til-uke": formaterPeriodeTilUkenummer(
                forstePeriode.periode.fraOgMed,
                forstePeriode.periode.tilOgMed,
              ),
            })}
          />
        </Alert>
      )}

      <PortableText value={getRichText("rapportering-innledning")} />

      <ReadMore header={getAppText("rapportering-arbeidstid-ikke-redusert-tittel")}>
        <PortableText value={getRichText("rapportering-arbeidstid-ikke-redusert")} />
      </ReadMore>

      {forstePeriode?.kanSendes === true && !feilType && (
        <>
          <Heading size="small" level="2" className="mt-8">
            {getAppText("rapportering-samtykke-tittel")}
          </Heading>

          <PortableText value={getRichText("rapportering-samtykke-beskrivelse")} />

          <NavigasjonContainer>
            <Button
              size="medium"
              className={navigasjonStyles.knapp}
              icon={<ArrowRightIcon aria-hidden />}
              iconPosition="right"
              onClick={startUtfylling}
              disabled={isSubmitting}
            >
              {getAppText("rapportering-knapp-neste")}
            </Button>
          </NavigasjonContainer>
        </>
      )}

      <NavigasjonContainer>
        <ReactLink
          as="Link"
          to={getLink("rapportering-se-og-endre").linkUrl}
          onClick={() => {
            const linkId = "rapportering-se-og-endre";
            trackNavigere({
              lenketekst: getLink(linkId).linkText,
              destinasjon: getLink(linkId).linkUrl,
              linkId,
            });
          }}
        >
          {getLink("rapportering-se-og-endre").linkText}
        </ReactLink>
      </NavigasjonContainer>
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
