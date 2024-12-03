import { ChevronRightIcon } from "@navikt/aksel-icons";

import styles from "./Scenario.module.css";

interface IScenario {
  tittel: string;
  onClick: () => void;
}

export function Scenario({ tittel, onClick }: IScenario) {
  return (
    <div className={styles.buttonContainer}>
      <button onClick={onClick} className={styles.button}>
        <span>{tittel}</span>
        <ChevronRightIcon title="a11y-title" fontSize="1.5rem" />
      </button>
    </div>
  );
}
