import { Button, Heading } from "@navikt/ds-react";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import { useEffect } from "react";
import { ErrorResponse, isRouteErrorResponse, useRouteLoaderData } from "react-router";

import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { useAnalytics } from "~/hooks/useAnalytics";
import { foundAppText, foundRichText, getAppText, getLink, getRichText } from "~/hooks/useSanity";
import type { ISanity } from "~/sanity/sanity.types";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";

import type { loader as RootLoader } from "../../root";
import { NavigasjonContainer } from "../navigasjon-container/NavigasjonContainer";

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
  sanityTexts: ISanity | undefined,
): {
  titleId: string;
  descriptionId: string;
  title: string;
  description: PortableTextBlock[];
} {
  const titleId = getErrorTitleTextId(error);
  const descriptionId = getErrorDescriptionTextId(error);

  const title = getAppText(sanityTexts, titleId);
  const description = getRichText(sanityTexts, descriptionId);

  const texts = { titleId, descriptionId, title, description };

  if (!foundAppText(title, titleId)) {
    texts.title = getAppText(sanityTexts, defaultTitle);
    console.warn("Fant ikke tittel for feilmelding", titleId);
  }

  if (!foundRichText(description, descriptionId)) {
    texts.description = getRichText(sanityTexts, defaultDescription);
    console.warn("Fant ikke beskrivelse for feilmelding", descriptionId);
  }

  return texts;
}

export function GeneralErrorBoundary({ error }: IProps) {
  // Root loader kan mangle data her (f.eks. hvis root sin egen loader feilet), så vi kan ikke bruke useSanity
  const rootData = useRouteLoaderData<typeof RootLoader>("root");
  const sanityTexts = rootData?.sanityTexts;
  const { titleId, descriptionId, title, description } = useGetErrorText(error, sanityTexts);
  const { trackFeilmelding } = useAnalytics();

  useEffect(() => {
    setBreadcrumbs([], (textId) => getAppText(sanityTexts, textId));
  }, [sanityTexts]);

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

      <NavigasjonContainer>
        <Button
          as="a"
          className={navigasjonStyles.knapp}
          href={getLink(sanityTexts, "rapportering-ga-til-mine-dagpenger").linkUrl}
        >
          {getLink(sanityTexts, "rapportering-ga-til-mine-dagpenger").linkText}
        </Button>
      </NavigasjonContainer>
    </>
  );
}
