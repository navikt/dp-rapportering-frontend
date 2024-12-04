import { Alert } from "@navikt/ds-react";

import styles from "./Error.module.css";

interface ErrorProps {
  title: string;
}

export const Error = ({ title }: ErrorProps) => {
  return (
    <Alert variant="error" className={styles.container}>
      {title}
    </Alert>
  );
};
