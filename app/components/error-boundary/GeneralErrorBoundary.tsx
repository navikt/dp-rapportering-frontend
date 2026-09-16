import { Button, Heading } from "@navikt/ds-react";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import { useEffect } from "react";
import { ErrorResponse, isRouteErrorResponse, useRouteLoaderData } from "react-router";

import { useAnalytics } from "~/hooks/useAnalytics";
import type { MeldekortBrukerflateApiResponse } from "~/sanity/queries/meldekort-brukerflate";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { sanityRichText, sanityTekst as visSanityTekst } from "~/utils/sanity.utils";

import type { loader as RootLoader } from "../../root";

export interface IError {
  statusText: string;
  data: string;
  status: string;
  message: string;
}

interface IProps {
  error: unknown | IError | ErrorResponse;
}

const defaultTitle = "rapportering-feilmelding-ukjent-feil-tittel";
const defaultDescription = "rapportering-feilmelding-ukjent-feil-beskrivelse";
export function getErrorTitleTextId(error: unknown | IError): string {
  if (isRouteErrorResponse(error)) {
    return `${error.data}-tittel`;
  }

  return defaultTitle;
}

export function getErrorDescriptionTextId(error: unknown | IError): string {
  if (isRouteErrorResponse(error)) {
    return `${error.data}-beskrivelse`;
  }

  if (error instanceof Error) {
    return `${error.message}-beskrivelse`;
  }

  return defaultDescription;
}

export function useGetErrorText(
  error: unknown | IError,
  sanityTekst: MeldekortBrukerflateApiResponse | undefined,
): {
  titleId: string;
  descriptionId: string;
  title: string;
  description: PortableTextBlock[];
} {
  const titleId = getErrorTitleTextId(error);
  const descriptionId = getErrorDescriptionTextId(error);

  const sanityTitle = sanityTekst?.feilmeldinger?.generellFeil?.tittel;
  const sanityDescription = sanityTekst?.feilmeldinger?.generellFeil?.tekst;
  const title = visSanityTekst(sanityTitle, "feilmeldinger.generellFeil.tittel");
  const description = sanityRichText(sanityDescription, "feilmeldinger.generellFeil.tekst");

  const texts = { titleId, descriptionId, title, description };

  return texts;
}

export function GeneralErrorBoundary({ error }: IProps) {
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const sanityTekst = rootData?.sanityTekst;
  const { titleId, descriptionId, title, description } = useGetErrorText(error, sanityTekst);
  const { trackFeilmelding } = useAnalytics();

  useEffect(() => {
    setBreadcrumbs([], (textId) => {
      if (textId === "rapportering-brodsmule-min-side") {
        return sanityTekst?.grunntekster?.minSide ?? textId;
      }

      if (textId === "rapportering-brodsmule-meldekort") {
        return sanityTekst?.grunntekster?.meldekort ?? textId;
      }

      return textId;
    });
  }, [sanityTekst]);

  useEffect(() => {
    // Logg besøk, titleId og descriptionId
    trackFeilmelding({ tekst: title, titleId, descriptionId });
    console.error(`${titleId}: ${descriptionId}`, error);
  }, []);

  return (
    <>
      <Heading spacing size="medium" level="2">
        {title}
      </Heading>

      <PortableText value={description} />

      <Button as="a" href="https://www.nav.no/minside">
        {visSanityTekst(sanityTekst?.knapper?.gaaTilMinSide, "knapper.gaaTilMinSide")}
      </Button>
    </>
  );
}
