import { FileCheckmarkIcon } from "@navikt/aksel-icons";
import { Detail } from "@navikt/ds-react";
import { useSanity } from "~/hooks/useSanity";
import styles from "../styles/lagretAutomatisk.module.css";

export function LagretAutomatisk() {
  const { getAppText } = useSanity();
  return (
    <div className={styles.lagretAutomatisk}>
      <FileCheckmarkIcon title="a11y-title" fontSize="1.5rem" />
      <Detail>{getAppText("rapportering-automatisk-lagring")}</Detail>
    </div>
  );
}
