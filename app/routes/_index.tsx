import { TZDate } from "@date-fns/tz";
import { ArrowRightIcon, InformationSquareIcon } from "@navikt/aksel-icons";
import { Button, Heading, InfoCard, ReadMore } from "@navikt/ds-react";
import { setBreadcrumbs as setDekoratorenBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { PortableText } from "@portabletext/react";
import { getISOWeek } from "date-fns";
import { useEffect } from "react";
import { LoaderFunctionArgs } from "react-router";
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useNavigation,
  useRouteError,
  useRouteLoaderData,
} from "react-router";

import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";
import { ReactLink } from "~/components/ReactLink";
import { useAnalytics } from "~/hooks/useAnalytics";
import { getSession } from "~/models/getSession.server";
import { hentRapporteringsperioder } from "~/models/rapporteringsperiode.server";
import { formaterDato } from "~/utils/dato.utils";
import { baseUrl } from "~/utils/dekoratoren.utils";
import { TIDSSONER } from "~/utils/types";
import { useIsSubmitting } from "~/utils/useIsSubmitting";

import type { loader as RootLoader } from "../root";
import styles from "../styles/root.module.css";
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

  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const startFetcher = useFetcher<typeof StartAction>();
  const { trackSkjemaStartet, trackNavigere } = useAnalytics();

  const forstePeriode = rapporteringsperioder[0];
  const grunntekster = rootData?.sanityTekst?.grunntekster;
  const velkomstside = rootData?.sanityTekst?.velkomstside;
  const knapper = rootData?.sanityTekst?.knapper;
  const forTidligTekst =
    forstePeriode && velkomstside?.innsendingsmulighet.forTidlig
      ? velkomstside.innsendingsmulighet.forTidlig
          .replaceAll(
            "{{ukeFom}}",
            getISOWeek(new TZDate(forstePeriode.periode.fraOgMed, TIDSSONER.OSLO)).toString(),
          )
          .replaceAll(
            "{{weekTom}}",
            getISOWeek(new TZDate(forstePeriode.periode.tilOgMed, TIDSSONER.OSLO)).toString(),
          )
          .replaceAll(
            "{{fom}}",
            formaterDato({ dato: new TZDate(forstePeriode.kanSendesFra, TIDSSONER.OSLO) }),
          )
      : undefined;

  const navigation = useNavigation();
  const isSubmitting = useIsSubmitting(navigation);

  useEffect(() => {
    if (grunntekster?.minSide && grunntekster.meldekort) {
      setDekoratorenBreadcrumbs([
        { title: grunntekster.minSide, url: "https://www.nav.no/minside" },
        { title: grunntekster.meldekort, url: `${baseUrl}/` },
      ]);
    }
  }, [grunntekster]);

  function startUtfylling() {
    trackSkjemaStartet(forstePeriode.id);
    startFetcher.submit(
      { rapporteringsperiodeId: forstePeriode.id },
      { method: "post", action: "/api/start" },
    );
  }

  return (
    <>
      <div className={styles.pageContent}>
        {velkomstside?.velkomstTekst && <PortableText value={velkomstside.velkomstTekst} />}

        {velkomstside?.harDuFaattDegJobb.tittel && velkomstside.harDuFaattDegJobb.tekst && (
          <ReadMore header={velkomstside.harDuFaattDegJobb.tittel}>
            <div>
              <PortableText value={velkomstside.harDuFaattDegJobb.tekst} />
            </div>
          </ReadMore>
        )}

        {rapporteringsperioder.length === 0 && velkomstside?.innsendingsmulighet.ingenMeldekort && (
          <InfoCard data-color="info">
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              {velkomstside.innsendingsmulighet.ingenMeldekort}
            </InfoCard.Message>
          </InfoCard>
        )}

        {forstePeriode && !forstePeriode.kanSendes && forTidligTekst && (
          <InfoCard data-color="info">
            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
              {forTidligTekst}
            </InfoCard.Message>
          </InfoCard>
        )}

        {forstePeriode?.kanSendes === true &&
          velkomstside?.innsendingsmulighet.klarTilInnsending && (
            <>
              <Heading size="small" level="2">
                {velkomstside.innsendingsmulighet.klarTilInnsending.tittel}
              </Heading>

              <PortableText value={velkomstside.innsendingsmulighet.klarTilInnsending.tekst} />
            </>
          )}
      </div>
      <div className={styles.buttonsContainerColumn}>
        {forstePeriode?.kanSendes === true && knapper?.neste && (
          <Button
            variant="primary"
            icon={<ArrowRightIcon aria-hidden />}
            iconPosition="right"
            onClick={startUtfylling}
            disabled={isSubmitting}
          >
            {knapper.neste}
          </Button>
        )}

        <ReactLink
          as="Link"
          to="/innsendt"
          onClick={() => {
            const linkId = "se-og-endre-innsendte-meldekort";
            trackNavigere({
              lenketekst: knapper?.seOgEndreInnsendteMeldekort ?? "",
              destinasjon: "/innsendt",
              linkId,
            });
          }}
        >
          {knapper?.seOgEndreInnsendteMeldekort}
        </ReactLink>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  // Root loader kan mangle data her (f.eks. ved ikke-matchende rute), så vi kan ikke bruke useTypedRouteLoaderData
  const rootData = useRouteLoaderData<typeof RootLoader>("root");

  if (isRouteErrorResponse(error)) {
    if (rootData?.env.IS_LOCALHOST && error.status === 440) {
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

  return <GeneralErrorBoundary error={error} />;
}
