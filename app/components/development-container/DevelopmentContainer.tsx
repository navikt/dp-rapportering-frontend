import styles from "./DevelopmentContainer.module.css";
import { Tag } from "@navikt/ds-react";
import { isLocalhost } from "~/utils/env.utils";

interface IProps {
  children: JSX.Element;
}

export function DevelopmentContainer({ children }: IProps) {
  return (
    <>
      {isLocalhost && (
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
