import classNames from "classnames";
import { hentDatoFraDatoString } from "~/utils/dato.utils";

import styles from "./Kalender.module.css";
import { useRouteLoaderData } from "@remix-run/react";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

interface IProps {
  aapneModal: (dato: string, datoIndex: number) => void;
}

export function Kalender(props: IProps) {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as {
    rapporteringsperiode: IRapporteringsperiode;
  };

  console.log(rapporteringsperiode);

  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];

  // const harNoenAktivitet = !!rapporteringsperiode.dager.find(
  //   (dager) => dager.aktiviteter.length > 0
  // );

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
          // [styles.harNoenAktivitet]: harNoenAktivitet,
        })}
      >
        {rapporteringsperiode.dager.map((dag) => {
          console.log(dag);
          // const harAktivitet = dag.aktiviteter.length > 0;

          // const timer = dag.aktiviteter.reduce((accumulator, current) => {
          //   return accumulator + current.timer;
          // }, 0);

          return (
            <div key={dag.dagIndex} className={styles.kalenderDag}>
              <button
                className={classNames(styles.kalenderDato, {
                  [styles.helg]: helgIndex.includes(dag.dagIndex),
                  // [styles.kalenderDatoMedAktivitet]: harAktivitet,
                })}
                onClick={() => props.aapneModal(dag.dato, dag.dagIndex)}
              >
                <p>{hentDatoFraDatoString(dag.dato)}</p>.
              </button>
              {/* {harAktivitet && (
                <div className={styles.kalenderDatoAktivitet}>
                  {timer.toString().replace(/\./g, ",")}t
                </div>
              )} */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
