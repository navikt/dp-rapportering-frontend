import classNames from "classnames";
import { PeriodeHeaderDetaljer } from "~/components/kalender/PeriodeHeaderDetaljer";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import styles from "./Kalender.module.css";
import { PeriodeListe } from "./PeriodeListe";
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

  return (
    <>
      <div className={styles.headerKontainer}>
        <PeriodeHeaderDetaljer rapporteringsperiode={rapporteringsperiode} />
        {visRedigeringsAlternativer && (
          <RedigeringsLenke id={rapporteringsperiode.id} status={rapporteringsperiode.status} />
        )}
      </div>
      <div
        className={classNames(styles.kalender, {
          [styles.readonly]: readonly,
        })}
      >
        <div className={styles.ukedagKontainer}>
          {ukedager.map((ukedag, index) => {
            return (
              <div key={`${rapporteringsperiode.id}-${index}`} className={styles.ukedag}>
                {ukedag}
              </div>
            );
          })}
        </div>
        <PeriodeListe
          readonly={readonly}
          rapporteringsperiode={rapporteringsperiode}
          aapneModal={aapneModal}
        />
      </div>
    </>
  );
}
