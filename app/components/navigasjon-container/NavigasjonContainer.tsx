import { JSX } from "react";

import styles from "./NavigasjonContainer.module.css";

interface IProps {
  children: React.ReactNode;
}

export function NavigasjonContainer(props: IProps): JSX.Element {
  const { children } = props;
  return <div className={styles.container}>{children}</div>;
}
