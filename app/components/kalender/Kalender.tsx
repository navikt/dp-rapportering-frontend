import { useRouteLoaderData } from "@remix-run/react";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { hentDatoFraDatoString } from "~/utils/dato.utils";
import { sorterOgStrukturerRapporteringsperiode } from "~/utils/rapporteringsperiode.utils";

import styles from "./Kalender.module.css";
import { useSanity } from "~/context/sanity-content";
import { ARBEID, FERIE, SYK } from "~/utils/constants";

interface IProps {
  aapneModal: (dato: string, datoIndex: number) => void;
}

export function Kalender(props: IProps) {
  const { rapporteringsperiode } = useRouteLoaderData(
    "routes/rapportering"
  ) as {
    rapporteringsperiode: IRapporteringsperiode;
  };

  const { getAppTekst } = useSanity();

  console.log(
    "hei",
    getAppTekst("dokumentkrav.side-metadata.meta-beskrivelse")
  );

  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];

  const periode = sorterOgStrukturerRapporteringsperiode(rapporteringsperiode);

  const harNoenAktivitet = !!periode.dager.find(
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
                  [styles.arbeid]:
                    harAktivitet && dag.aktiviteter[0].type === ARBEID,
                  [styles.sykdom]:
                    harAktivitet && dag.aktiviteter[0].type === SYK,
                  [styles.ferie]:
                    harAktivitet && dag.aktiviteter[0].type === FERIE,
                })}
                onClick={() => props.aapneModal(dag.dato, dag.dagIndex)}
              >
                <p>{hentDatoFraDatoString(dag.dato)}</p>.
              </button>
              {harAktivitet && (
                <div
                  className={classNames(styles.kalenderDatoAktivitet, {
                    [styles.timerArbeid]:
                      harAktivitet && dag.aktiviteter[0].type === ARBEID,
                    [styles.timerSykdom]:
                      harAktivitet && dag.aktiviteter[0].type === SYK,
                    [styles.timerFerie]:
                      harAktivitet && dag.aktiviteter[0].type === FERIE,
                  })}
                >
                  {timer.toString().replace(/\./g, ",")}t
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
