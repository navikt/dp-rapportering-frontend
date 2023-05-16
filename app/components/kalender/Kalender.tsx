import classNames from "classnames";
import { periodeMock } from "~/mocks/periodeMock";
import { hentDatoFraDatoString } from "~/utils/dato.utils";
import styles from "./Kalender.module.css";

interface IProps {
  aapneModal: (dato: string, datoIndex: number) => void;
}

export function Kalender(props: IProps) {
  const periode = periodeMock;
  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];

  return (
    <div className={styles.kalender}>
      <div className={styles.kalenderUkedagKontainer}>
        {ukedager.map((ukedag, index) => {
          return (
            <div key={index} className={styles.kalenderUkedag}>
              {ukedag}
            </div>
          );
        })}
      </div>
      <div className={styles.kalenderDatoKontainer}>
        {periode.dager.map((dag) => {
          return (
            <button
              className={classNames(styles.kalenderDato, {
                [styles.helg]: helgIndex.includes(dag.dagIndex),
              })}
              key={dag.dagIndex}
              onClick={() => props.aapneModal(dag.dato, dag.dagIndex)}
            >
              <p>{hentDatoFraDatoString(dag.dato)}</p>.
            </button>
          );
        })}
      </div>
    </div>
  );
}
