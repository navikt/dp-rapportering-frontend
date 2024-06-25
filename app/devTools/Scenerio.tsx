import styles from "./Scenerio.module.css";
import { ChevronRightIcon } from "@navikt/aksel-icons";

interface IScenerio {
  tittel: string;
  value: string;
  onClick: () => void;
}

export function Scenerio({ tittel, value, onClick }: IScenerio) {
  return (
    <div className={styles.buttonContainer}>
      <button
        type="submit"
        name="scenerio"
        value={value}
        onClick={onClick}
        className={styles.button}
      >
        <span>{tittel}</span>
        <ChevronRightIcon title="a11y-title" fontSize="1.5rem" />
      </button>
    </div>
  );
}
