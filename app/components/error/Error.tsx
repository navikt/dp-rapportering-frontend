import { Alert } from "@navikt/ds-react";

import styles from "./Error.module.css";

interface ErrorProps {
  title: string;
}

export const Error = ({ title }: ErrorProps) => {
  return (
    <Alert role="alert" variant="error" className={styles.container}>
      {title}
    </Alert>
  );
};
