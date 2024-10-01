import { Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import { isRouteErrorResponse } from "@remix-run/react";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "../RemixLink";
import Center from "../center/Center";

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

      <Center className="my-8">
        <RemixLink as="Button" to="/">
          {getAppText("rapportering-tilbake-til-startside")}
        </RemixLink>
      </Center>

      <Center>
        <RemixLink className="my-8" as="Link" to={getLink("rapportering-se-og-endre").linkUrl}>
          {getLink("rapportering-se-og-endre").linkText}
        </RemixLink>
      </Center>
    </>
  );
}
