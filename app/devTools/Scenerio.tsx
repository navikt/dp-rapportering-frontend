import styles from "./Scenerio.module.css";
import { ChevronRightIcon } from "@navikt/aksel-icons";

interface IScenerio {
  tittel: string;
  onClick: () => void;
}

export function Scenerio({ tittel, onClick }: IScenerio) {
  return (
    <div className={styles.buttonContainer}>
      <button onClick={onClick} className={styles.button}>
        <span>{tittel}</span>
        <ChevronRightIcon title="a11y-title" fontSize="1.5rem" />
      </button>
    </div>
  );
}
