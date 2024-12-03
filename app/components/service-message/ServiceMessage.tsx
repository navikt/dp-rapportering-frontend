import { Alert, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";

import { ISanityMessage } from "~/sanity/sanity.types";

interface IProps {
  message: ISanityMessage;
}

export function ServiceMessage(props: IProps): JSX.Element | undefined {
  const { message } = props;
  return (
    <Alert variant={message.variant ?? "info"} className="my-4 alert-with-rich-text">
      {message.title && (
        <Heading spacing size="small" level="2">
          {message.title}
        </Heading>
      )}
      {message.body && <PortableText value={message.body} />}
    </Alert>
  );
}
