import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import { format } from "date-fns";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import styles from "./Kalender.module.css";
import { periodeSomTimer } from "~/utils/periode.utils";

interface IProps {
  aapneModal: (dato: string) => void;
}

export function Kalender(props: IProps) {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as {
    rapporteringsperiode: IRapporteringsperiode;
  };

  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];

  const harNoenAktivitet = !!rapporteringsperiode.dager.find(
    (dager) => dager.aktiviteter.length > 0
  );

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
        {rapporteringsperiode.dager.map((dag) => {
          const harAktivitet = dag.aktiviteter.length > 0;

          const timer = dag.aktiviteter.reduce((accumulator, current) => {
            if (current.timer) {
              return accumulator + periodeSomTimer(current.timer);
            }
            return accumulator + 1;
          }, 0);

          return (
            <div key={dag.dagIndex} className={styles.kalenderDag}>
              <button
                className={classNames(styles.kalenderDato, {
                  [styles.helg]: helgIndex.includes(dag.dagIndex),
                  [styles.kalenderDatoMedAktivitet]: harAktivitet,
                  [styles.arbeid]: harAktivitet && dag.aktiviteter[0].type === "Arbeid",
                  [styles.sykdom]: harAktivitet && dag.aktiviteter[0].type === "Syk",
                  [styles.ferie]: harAktivitet && dag.aktiviteter[0].type === "Ferie",
                })}
                onClick={() => props.aapneModal(dag.dato)}
              >
                <p>{format(new Date(dag.dato), "dd")}</p>.
              </button>
              {harAktivitet && (
                <div
                  className={classNames(styles.kalenderDatoAktivitet, {
                    [styles.timerArbeid]: harAktivitet && dag.aktiviteter[0].type === "Arbeid",
                    [styles.timerSykdom]: harAktivitet && dag.aktiviteter[0].type === "Syk",
                    [styles.timerFerie]: harAktivitet && dag.aktiviteter[0].type === "Ferie",
                  })}
                >
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid") && (
                    <> {timer.toString().replace(/\./g, ",")}t</>
                  )}
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Syk") && <>Syk</>}
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Ferie") && <>Ferie</>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
