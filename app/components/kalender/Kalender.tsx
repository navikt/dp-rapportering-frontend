import classNames from "classnames";
import { format } from "date-fns";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import styles from "./Kalender.module.css";
import { periodeSomTimer } from "~/utils/periode.utils";
import { PeriodeHeaderDetaljer } from "~/components/PeriodeHeaderDetaljer";
import { Link } from "@navikt/ds-react";

interface IProps {
  aapneModal: (dato: string) => void;
  rapporteringsperiode: IRapporteringsperiode;
  visRedigeringsAlternativer?: boolean;
}

function KalenderPeriodeRedigeringsLenke(props: { id: string; status: string; vis: boolean }) {
  if (!props.vis) return <></>;
  const lenketekst = finnLenkeTekstFraStatus(props.status);
  const lenkesti = finnLenkeDestinationFraStatus(props.status);

  return (
    <Link
      href={`/rapportering/periode/${props.id}/${lenkesti}`}
      className={styles.kalenderHeaderPeriodeAlternativer}
    >
      {lenketekst}
    </Link>
  );
  function finnLenkeTekstFraStatus(status: string) {
    switch (status) {
      case "TilUtfylling":
        return "Fyll ut";
      case "Godkjent":
        return "Rediger";
      case "Innsendt":
        return "Korriger";
      default:
        return "ingen statusmatch";
    }
  }

  function finnLenkeDestinationFraStatus(status: string) {
    switch (status) {
      case "TilUtfylling":
        return "fyllut";
      case "Godkjent":
        return "avgodkjenn";
      case "Innsendt":
        return "korriger";
      default:
        console.log("Traff ukjent status i kalenderlenke: ", status);
        return;
    }
  }
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

        <KalenderPeriodeRedigeringsLenke
          id={rapporteringsperiode.id}
          status={rapporteringsperiode.status}
          vis={visRedigeringsAlternativer}
        />
      </div>
      <div className={styles.kalender}>
        <br />
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
                  onClick={() => aapneModal(dag.dato)}
                >
                  <p>{format(new Date(dag.dato), "dd")}</p>.
                </button>
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
