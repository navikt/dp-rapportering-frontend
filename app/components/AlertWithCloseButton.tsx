import { Alert, AlertProps } from "@navikt/ds-react";
import React from "react";

interface Props {
  children?: React.ReactNode;
  variant: AlertProps["variant"];
}

export function AlertWithCloseButton({ children, variant }: Props) {
  const [show, setShow] = React.useState(true);

  return show ? (
    <Alert variant={variant} closeButton onClose={() => setShow(false)}>
      {children || "Content"}
    </Alert>
  ) : null;
}
