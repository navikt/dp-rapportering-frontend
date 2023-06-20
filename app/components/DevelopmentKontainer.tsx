import { Tag } from "@navikt/ds-react";
import styles from "./DevelopmentKontainer.module.css";
import { getEnv } from "~/utils/env.utils";

interface IProps {
  children: JSX.Element;
}

export function DevelopmentKontainer({ children }: IProps) {
  return (
    <>
      {getEnv("IS_LOCALHOST") === "true" && (
        <div className={styles.kontainer}>
          <Tag variant="neutral" className={styles.tag}>
            Development
          </Tag>
          {children}
        </div>
      )}
    </>
  );
}
