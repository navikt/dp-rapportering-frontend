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

  const harNoenAktivitet = !!periode.dager.find((dager) => dager.aktiviteter.length > 0);

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
      <div
        className={classNames(styles.kalenderDatoKontainer, {
          [styles.harNoenAktivitet]: harNoenAktivitet,
        })}
      >
        {periode.dager.map((dag) => {
          const harAktivitet = dag.aktiviteter.length > 0;

          const timer = dag.aktiviteter.reduce((accumulator, current) => {
            return accumulator + current.timer;
          }, 0);

          return (
            <div key={dag.dagIndex} className={styles.kalenderDag}>
              <button
                className={classNames(styles.kalenderDato, {
                  [styles.helg]: helgIndex.includes(dag.dagIndex),
                  [styles.kalenderDatoMedAktivitet]: harAktivitet,
                })}
                onClick={() => props.aapneModal(dag.dato, dag.dagIndex)}
              >
                <p>{hentDatoFraDatoString(dag.dato)}</p>.
              </button>
              {harAktivitet && <div className={styles.kalenderDatoAktivitet}>{timer}t</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
