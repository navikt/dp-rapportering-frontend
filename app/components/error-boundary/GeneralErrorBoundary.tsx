import { Button, Heading } from "@navikt/ds-react";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import { ErrorResponse, isRouteErrorResponse } from "@remix-run/react";
import { useEffect } from "react";

import navigasjonStyles from "~/components/navigasjon-container/NavigasjonContainer.module.css";
import { useAnalytics } from "~/hooks/useAnalytics";
import { foundAppText, foundRichText, useSanity } from "~/hooks/useSanity";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";

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

export function useGetErrorText(error: unknown | IError): {
  titleId: string;
  descriptionId: string;
  title: string;
  description: PortableTextBlock[];
} {
  const { getRichText, getAppText } = useSanity();

  const titleId = getErrorTitleTextId(error);
  const descriptionId = getErrorDescriptionTextId(error);

  const title = getAppText(titleId);
  const description = getRichText(descriptionId);

  const texts = { titleId, descriptionId, title, description };

  if (!foundAppText(title, titleId)) {
    texts.title = getAppText(defaultTitle);
    console.warn("Fant ikke tittel for feilmelding", titleId);
  }

  if (!foundRichText(description, descriptionId)) {
    texts.description = getRichText(defaultDescription);
    console.warn("Fant ikke beskrivelse for feilmelding", descriptionId);
  }

  return texts;
}

export function GeneralErrorBoundary({ error }: IProps) {
  const { getAppText, getLink } = useSanity();
  const { titleId, descriptionId, title, description } = useGetErrorText(error);
  const { trackFeilmelding } = useAnalytics();

  useEffect(() => {
    setBreadcrumbs([], getAppText);
  }, [getAppText]);

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
          href={getLink("rapportering-ga-til-mine-dagpenger").linkUrl}
        >
          {getLink("rapportering-ga-til-mine-dagpenger").linkText}
        </Button>
      </NavigasjonContainer>
    </>
  );
}
