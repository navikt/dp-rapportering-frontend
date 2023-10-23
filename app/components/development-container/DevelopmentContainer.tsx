import { Tag } from "@navikt/ds-react";
import styles from "./DevelopmentContainer.module.css";
import { getEnv } from "~/utils/env.utils";

interface IProps {
  children: JSX.Element;
}

export function DevelopmentContainer({ children }: IProps) {
  return (
    <>
      {getEnv("IS_LOCALHOST") === "true" && (
        <div className={styles.container}>
          <Tag variant="neutral" className={styles.tag}>
            Development
          </Tag>
          {children}
        </div>
      )}
    </>
  );
}
