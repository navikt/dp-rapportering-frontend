import styles from "./Error.module.css";
import { Alert } from "@navikt/ds-react";

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
