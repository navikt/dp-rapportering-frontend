import { Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { isRouteErrorResponse } from "@remix-run/react";
import { useEffect } from "react";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "../RemixLink";

interface IError {
  statusText: string;
  data: string;
  status: string;
  message: string;
}

interface IProps {
  error: unknown | IError;
}

export function GeneralErrorBoundary({ error }: IProps) {
  const { getRichText, getAppText, getLink } = useSanity();

  useEffect(() => {
    setBreadcrumbs([], getAppText);
  }, [getAppText]);

  let title: string = "";
  let body: string = "";

  if (isRouteErrorResponse(error)) {
    title = `${error.data}-tittel`;
    body = `${error.data}-beskrivelse`;
  } else if (error instanceof Error) {
    title = "rapportering-feilmelding-ukjent-feil-tittel";
    body = `${error.message}-beskrivelse`;
  }

  return (
    <>
      <Heading spacing size="medium" level="2">
        {getAppText(title)}
      </Heading>

      <PortableText value={getRichText(body)} />

      <div className="navigasjon-container">
        <RemixLink
          className="px-16"
          as="Button"
          to={getLink("rapportering-ga-til-mine-meldekort").linkUrl}
        >
          {getLink("rapportering-ga-til-mine-meldekort").linkText}
        </RemixLink>
      </div>

      <div className="navigasjon-container">
        <RemixLink as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </div>
    </>
  );
}
