import classNames from "classnames";
import { format } from "date-fns";
import { PeriodeHeaderDetaljer } from "~/components/kalender/PeriodeHeaderDetaljer";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import styles from "./Kalender.module.css";
import { RedigeringsLenke } from "./RedigeringsLenke";

interface IProps {
  aapneModal: (dato: string) => void;
  rapporteringsperiode: IRapporteringsperiode;
  visRedigeringsAlternativer?: boolean;
  readonly?: boolean;
}

export function Kalender(props: IProps) {
  const {
    rapporteringsperiode,
    aapneModal,
    visRedigeringsAlternativer = false,
    readonly = false,
  } = props;

  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];

  const harNoenAktivitet = !!rapporteringsperiode.dager.find(
    (dager) => dager.aktiviteter.length > 0
  );

  // Komponenten har blitt veldig komplisert
  // Denne her bør refaktureres

  return (
    <>
      <div className={styles.kalenderHeaderKontainer}>
        <div className={styles.kalenderHeaderPeriodeDetaljer}>
          <PeriodeHeaderDetaljer rapporteringsperiode={rapporteringsperiode} />
        </div>
        <div className={styles.kalenderHeaderPeriodeAlternativer}>
          {visRedigeringsAlternativer && (
            <RedigeringsLenke id={rapporteringsperiode.id} status={rapporteringsperiode.status} />
          )}
        </div>
      </div>
      <div
        className={classNames(styles.kalender, {
          [styles.readonly]: readonly,
        })}
      >
        <div className={styles.kalenderUkedagKontainer}>
          {ukedager.map((ukedag, index) => {
            return (
              <div key={`${rapporteringsperiode.id}-${index}`} className={styles.kalenderUkedag}>
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
            const ikkeRapporteringspliktig = !harAktivitet && dag.muligeAktiviteter.length === 0;
            const dagKnappStyle = {
              [styles.kalenderDatoMedAktivitet]: harAktivitet,
              [styles.arbeid]: harAktivitet && dag.aktiviteter[0].type === "Arbeid",
              [styles.sykdom]: harAktivitet && dag.aktiviteter[0].type === "Syk",
              [styles.ferie]: harAktivitet && dag.aktiviteter[0].type === "Ferie",
            };

            const timer = dag.aktiviteter.reduce((accumulator, current) => {
              if (current.timer) {
                return accumulator + periodeSomTimer(current.timer);
              }
              return accumulator + 1;
            }, 0);

            return (
              <div key={dag.dagIndex} className={styles.kalenderDag}>
                {ikkeRapporteringspliktig && (
                  <div className={classNames(styles.kalenderDato, styles.ikkeRapporteringspliktig)}>
                    <p>{format(new Date(dag.dato), "dd")}.</p>
                  </div>
                )}

                {!ikkeRapporteringspliktig && !readonly && (
                  <button
                    className={classNames(styles.kalenderDato, dagKnappStyle)}
                    onClick={() => aapneModal(dag.dato)}
                  >
                    <p>{format(new Date(dag.dato), "dd")}.</p>
                  </button>
                )}

                {!ikkeRapporteringspliktig && readonly && (
                  <div
                    className={classNames(styles.kalenderDato, dagKnappStyle)}
                    onClick={() => aapneModal(dag.dato)}
                  >
                    <p>{format(new Date(dag.dato), "dd")}.</p>
                  </div>
                )}

                {harAktivitet && (
                  <div
                    className={classNames(styles.kalenderDatoAktivitet, {
                      [styles.kalenderDatoAktivitetAktivitetSykdom]:
                        harAktivitet && dag.aktiviteter[0].type === "Syk",
                      [styles.kalenderDatoAktivitetAktivitetFerie]:
                        harAktivitet && dag.aktiviteter[0].type === "Ferie",
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
      </div>
    </>
  );
}
