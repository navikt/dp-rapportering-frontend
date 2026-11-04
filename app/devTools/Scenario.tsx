import { ChevronRightIcon } from "@navikt/aksel-icons";

import type { ScenarioType } from ".";
import styles from "./Scenario.module.css";

interface IScenario {
  tittel: string;
  type: ScenarioType;
}

export function Scenario({ tittel, type }: IScenario) {
  return (
    <div className={styles.buttonContainer}>
      <button type="submit" name="type" value={type} className={styles.button}>
        <span>{tittel}</span>
        <ChevronRightIcon title="a11y-title" fontSize="1.5rem" />
      </button>
    </div>
  );
}
