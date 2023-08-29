import { Heading } from "@navikt/ds-react";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";
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

  const ukedager = [
    { kort: "man", lang: "mandag" },
    { kort: "tir", lang: "tirsdag" },
    { kort: "ons", lang: "onsdag" },
    { kort: "tor", lang: "torsdag" },
    { kort: "fre", lang: "fredag" },
    { kort: "lør", lang: "lørdag" },
    { kort: "søn", lang: "søndag" },
  ];

  const { fraOgMed, tilOgMed } = rapporteringsperiode;

  return (
    <>
      <div className={styles.headerKontainer}>
        <div>
          <Heading level="3" size="small" className={styles.header}>
            {`Uke ${formaterPeriodeTilUkenummer(
              rapporteringsperiode.fraOgMed,
              rapporteringsperiode.tilOgMed
            )}`}
          </Heading>
          <span className="tekst-subtil">{formaterPeriodeDato(fraOgMed, tilOgMed)}</span>
        </div>
        {visRedigeringsAlternativer && (
          <RedigeringsLenke id={rapporteringsperiode.id} status={rapporteringsperiode.status} />
        )}
      </div>
      <table
        className={classNames(styles.kalender, {
          [styles.readonly]: readonly,
        })}
        role="grid"
      >
        <thead aria-hidden="true">
          <tr className={styles.ukeRadKontainer}>
            {ukedager.map((ukedag, index) => {
              return (
                <th
                  scope="col"
                  key={`${rapporteringsperiode.id}-${index}`}
                  className={styles.ukedag}
                >
                  <span>{ukedag.kort}</span>
                  <span className="navds-sr-only">{ukedag.lang}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <PeriodeListe
          readonly={readonly}
          rapporteringsperiode={rapporteringsperiode}
          aapneModal={aapneModal}
        />
      </table>
    </>
  );
}
