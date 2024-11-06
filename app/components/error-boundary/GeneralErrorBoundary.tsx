import { Button, Heading } from "@navikt/ds-react";
import { PortableText, PortableTextBlock } from "@portabletext/react";
import { ErrorResponse, isRouteErrorResponse } from "@remix-run/react";
import { useEffect } from "react";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { foundAppText, foundRichText, useSanity } from "~/hooks/useSanity";

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
  title: string;
  description: PortableTextBlock[];
} {
  const { getRichText, getAppText } = useSanity();

  const titleTextId = getErrorTitleTextId(error);
  const descriptionTextId = getErrorDescriptionTextId(error);

  const title = getAppText(titleTextId);
  const description = getRichText(descriptionTextId);

  const texts = { title, description };

  if (!foundAppText(title, titleTextId)) {
    texts.title = getAppText(defaultTitle);
    console.error("Fant ikke tittel for feilmelding", titleTextId);
  }

  if (!foundRichText(description, descriptionTextId)) {
    texts.description = getRichText(defaultDescription);
    console.error("Fant ikke beskrivelse for feilmelding", descriptionTextId);
  }

  return texts;
}

export function GeneralErrorBoundary({ error }: IProps) {
  const { getAppText, getLink } = useSanity();
  const { title, description } = useGetErrorText(error);

  useEffect(() => {
    setBreadcrumbs([], getAppText);
  }, [getAppText]);

  console.error(title, description, JSON.stringify(error, Object.getOwnPropertyNames(error)));

  return (
    <>
      <Heading spacing size="medium" level="2">
        {getAppText(title)}
      </Heading>

      <PortableText value={description} />

      <div className="navigasjon-container">
        <Button
          as="a"
          className="navigasjonsknapp"
          href={getLink("rapportering-ga-til-mine-dagpenger").linkUrl}
        >
          {getLink("rapportering-ga-til-mine-dagpenger").linkText}
        </Button>
      </div>
    </>
  );
}
