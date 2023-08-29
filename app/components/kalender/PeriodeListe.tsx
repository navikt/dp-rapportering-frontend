import classNames from "classnames";
import { format } from "date-fns";
import type {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import styles from "./Kalender.module.css";

interface IProps {
  rapporteringsperiode: IRapporteringsperiode;
  aapneModal: (dato: string) => void;
  readonly?: boolean;
}

export function PeriodeListe(props: IProps) {
  const { rapporteringsperiode, readonly, aapneModal } = props;

  const forsteUke = [...rapporteringsperiode.dager].splice(0, 7);
  const andreUke = [...rapporteringsperiode.dager].splice(7, 7);

  function hentAntallTimer(dag: IRapporteringsperiodeDag) {
    const timer = dag.aktiviteter.reduce((accumulator, current) => {
      if (current.timer) {
        return accumulator + periodeSomTimer(current.timer);
      }
      return accumulator + 1;
    }, 0);

    return <>{timer.toString().replace(/\./g, ",")}t</>;
  }

  return (
    <tbody className={styles.ukerKontainer}>
      <tr className={styles.ukeRadKontainer}>
        {forsteUke.map((dag) => {
          const dagenHarAktivitet = dag.aktiviteter.length > 0;
          const ikkeRapporteringspliktig = !dagenHarAktivitet && dag.muligeAktiviteter.length === 0;

          const dagKnappStyle = {
            [styles.arbeid]: dagenHarAktivitet && dag.aktiviteter[0].type === "Arbeid",
            [styles.sykdom]: dagenHarAktivitet && dag.aktiviteter[0].type === "Syk",
            [styles.ferie]: dagenHarAktivitet && dag.aktiviteter[0].type === "Ferie",
          };

          return (
            <td key={dag.dagIndex} className={styles.datoKontainer}>
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
                    [styles.datoMedAktivitetSykdom]:
                      dagenHarAktivitet && dag.aktiviteter[0].type === "Syk",
                    [styles.datoMedAktivitetFerie]:
                      dagenHarAktivitet && dag.aktiviteter[0].type === "Ferie",
                  })}
                >
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid") &&
                    hentAntallTimer(dag)}
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type !== "Arbeid") && <>1d</>}
                </div>
              )}
            </td>
          );
        })}
      </tr>

      <tr className={styles.ukeRadKontainer}>
        {andreUke.map((dag) => {
          const dagenHarAktivitet = dag.aktiviteter.length > 0;
          const ikkeRapporteringspliktig = !dagenHarAktivitet && dag.muligeAktiviteter.length === 0;

          const dagKnappStyle = {
            [styles.arbeid]: dagenHarAktivitet && dag.aktiviteter[0].type === "Arbeid",
            [styles.sykdom]: dagenHarAktivitet && dag.aktiviteter[0].type === "Syk",
            [styles.ferie]: dagenHarAktivitet && dag.aktiviteter[0].type === "Ferie",
          };

          return (
            <td key={dag.dagIndex} className={styles.datoKontainer}>
              {ikkeRapporteringspliktig && (
                <button className={classNames(styles.dato, styles.ikkeRapporteringspliktig)}>
                  <p>{format(new Date(dag.dato), "dd")}.</p>
                </button>
              )}

              {!ikkeRapporteringspliktig && !readonly && (
                <button
                  className={classNames(styles.dato, dagKnappStyle)}
                  onClick={() => aapneModal(dag.dato)}
                >
                  {format(new Date(dag.dato), "dd")}.
                </button>
              )}

              {!ikkeRapporteringspliktig && readonly && (
                <button
                  className={classNames(styles.dato, dagKnappStyle)}
                  onClick={() => aapneModal(dag.dato)}
                >
                  {format(new Date(dag.dato), "dd")}.
                </button>
              )}

              {dagenHarAktivitet && (
                <div
                  className={classNames(styles.datoMedAktivitet, {
                    [styles.datoMedAktivitetSykdom]:
                      dagenHarAktivitet && dag.aktiviteter[0].type === "Syk",
                    [styles.datoMedAktivitetFerie]:
                      dagenHarAktivitet && dag.aktiviteter[0].type === "Ferie",
                  })}
                >
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid") &&
                    hentAntallTimer(dag)}
                  {dag.aktiviteter.some((aktivitet) => aktivitet.type !== "Arbeid") && <>1d</>}
                </div>
              )}
            </td>
          );
        })}
      </tr>
    </tbody>
  );
}
