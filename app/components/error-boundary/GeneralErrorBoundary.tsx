import { Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { isRouteErrorResponse } from "@remix-run/react";
import { useEffect } from "react";
import { setBreadcrumbs } from "~/utils/dekoratoren.utils";
import { useSanity } from "~/hooks/useSanity";

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

  console.error(error);

  return (
    <>
      <Heading spacing size="medium" level="2">
        {getAppText(title)}
      </Heading>

      <PortableText value={getRichText(body)} />

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
