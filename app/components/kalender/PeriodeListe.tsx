import classNames from "classnames";
import { format } from "date-fns";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import styles from "./Kalender.module.css";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
  aapneModal: (dato: string) => void;
  readonly?: boolean;
}

export function PeriodeListe(props: IProps) {
  const { rapporteringsperiode, readonly = false, aapneModal } = props;

  const periodenHarMinstEnAktivitet = !!rapporteringsperiode.dager.find(
    (dag) => dag.aktiviteter.length > 0
  );

  return (
    <div
      className={classNames(styles.dagKontainer, {
        [styles.periodenHarMinstEnAktivitet]: periodenHarMinstEnAktivitet,
      })}
    >
      {rapporteringsperiode.dager.map((dag) => {
        const dagenHarAktivitet = dag.aktiviteter.length > 0;

        const ikkeRapporteringspliktig = !dagenHarAktivitet && dag.muligeAktiviteter.length === 0;

        const dagKnappStyle = {
          [styles.datoMedAktivitet]: dagenHarAktivitet,
          [styles.arbeid]: dagenHarAktivitet && dag.aktiviteter[0].type === "Arbeid",
          [styles.sykdom]: dagenHarAktivitet && dag.aktiviteter[0].type === "Syk",
          [styles.ferie]: dagenHarAktivitet && dag.aktiviteter[0].type === "Ferie",
        };

        const timer = dag.aktiviteter.reduce((accumulator, current) => {
          if (current.timer) {
            return accumulator + periodeSomTimer(current.timer);
          }
          return accumulator + 1;
        }, 0);

        return (
          <div key={dag.dagIndex} className={styles.dagKontainer}>
            {ikkeRapporteringspliktig && (
              <div className={classNames(styles.dato, styles.ikkeRapporteringspliktig)}>
                <p>{format(new Date(dag.dato), "dd")}.</p>
              </div>
            )}

            {!ikkeRapporteringspliktig && !readonly && (
              <button
                className={classNames(styles.dato, dagKnappStyle)}
                onClick={() => aapneModal(dag.dato)}
              >
                <p>{format(new Date(dag.dato), "dd")}.</p>
              </button>
            )}

            {!ikkeRapporteringspliktig && readonly && (
              <div
                className={classNames(styles.dato, dagKnappStyle)}
                onClick={() => aapneModal(dag.dato)}
              >
                <p>{format(new Date(dag.dato), "dd")}.</p>
              </div>
            )}

            {dagenHarAktivitet && (
              <div
                className={classNames(styles.datoMedAktivitet, {
                  [styles.datoMedAktivitetAktivitetSykdom]:
                    dagenHarAktivitet && dag.aktiviteter[0].type === "Syk",
                  [styles.datoMedAktivitetAktivitetFerie]:
                    dagenHarAktivitet && dag.aktiviteter[0].type === "Ferie",
                })}
              >
                {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid") && (
                  <>{timer.toString().replace(/\./g, ",")}t</>
                )}
                {dag.aktiviteter.some((aktivitet) => aktivitet.type !== "Arbeid") && <>1d</>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
