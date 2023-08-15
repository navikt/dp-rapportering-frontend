import { Tag } from "@navikt/ds-react";
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
}

export function Kalender(props: IProps) {
  const { rapporteringsperiode, aapneModal, visRedigeringsAlternativer = false } = props;

  const ukedager = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  const helgIndex = [5, 6, 12, 13];

  const harNoenAktivitet = !!rapporteringsperiode.dager.find(
    (dager) => dager.aktiviteter.length > 0
  );

  return (
    <>
      <div className={styles.kalenderHeaderKontainer}>
        <div className={styles.kalenderHeaderPeriodeDetaljer}>
          <PeriodeHeaderDetaljer rapporteringsperiode={rapporteringsperiode} />
        </div>
        <div className={styles.kalenderHeaderPeriodeAlternativer}>
          <span className={styles.statusTag}>
            Status:{" "}
            <Tag variant="neutral-moderate">
              {rapporteringsperiode.status === "TilUtfylling"
                ? "Til utfylling"
                : rapporteringsperiode.status}
            </Tag>
          </span>
          {visRedigeringsAlternativer && (
            <RedigeringsLenke id={rapporteringsperiode.id} status={rapporteringsperiode.status} />
          )}
        </div>
      </div>
      <div className={styles.kalender}>
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
            const erIkkeRapporteringspliktig = !harAktivitet && dag.muligeAktiviteter.length === 0;
            const dagKnappStyle = {
              [styles.helg]: helgIndex.includes(dag.dagIndex),
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
                {erIkkeRapporteringspliktig && (
                  <div
                    className={classNames(styles.kalenderDato, styles.erIkkeRapporteringspliktig)}
                  >
                    <p>{format(new Date(dag.dato), "dd")}.</p>
                  </div>
                )}
                {!erIkkeRapporteringspliktig && (
                  <button
                    className={classNames(styles.kalenderDato, dagKnappStyle)}
                    onClick={() => aapneModal(dag.dato)}
                  >
                    <p>{format(new Date(dag.dato), "dd")}.</p>
                  </button>
                )}
                {harAktivitet && dag.aktiviteter[0].type === "Arbeid" && (
                  <div
                    className={classNames(styles.kalenderDatoAktivitet, {
                      [styles.timerArbeid]: harAktivitet && dag.aktiviteter[0].type === "Arbeid",
                    })}
                  >
                    {dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid") && (
                      <> {timer.toString().replace(/\./g, ",")}t</>
                    )}
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
