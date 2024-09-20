import styles from "./KanIkkeSendes.module.css";
import { Alert } from "@navikt/ds-react";

interface IProps {
  kanSendes: boolean;
  children: React.ReactNode;
}

export function KanIkkeSendes(props: IProps): JSX.Element | undefined {
  if (!props.kanSendes) {
    return (
      <Alert variant="warning" className={styles.margin}>
        {props.children}
      </Alert>
    );
  }

  return undefined;
}
