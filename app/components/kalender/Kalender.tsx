import styles from "./Kalender.module.css";
import { RedigeringsLenke } from "./RedigeringsLenke";
import { Uke } from "./Uke";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer, getWeekDays } from "~/utils/dato.utils";

interface IProps {
  aapneModal: (dato: string) => void;
  rapporteringsperiode: IRapporteringsperiode;
  readonly?: boolean;
}

export function Kalender(props: IProps) {
  const { rapporteringsperiode, aapneModal, readonly = false } = props;

  const ukedager = getWeekDays("nb-NO");

  const { fraOgMed, tilOgMed } = rapporteringsperiode.periode;

  const forsteUke = [...rapporteringsperiode.dager].splice(0, 7);
  const andreUke = [...rapporteringsperiode.dager].splice(7, 7);

  const periodeUkenummerTekst = `Uke ${formaterPeriodeTilUkenummer(
    rapporteringsperiode.periode.fraOgMed,
    rapporteringsperiode.periode.tilOgMed
  )}`;

  const periodeFomTomDatoTekst = formaterPeriodeDato(fraOgMed, tilOgMed);
  const forsteUkeHarMinstEnAktivitet = forsteUke.some((dag) => dag.aktiviteter.length > 0);

  return (
    <>
      <div className={styles.headerKontainer}>
        <div>
          <p className={styles.header} aria-hidden>
            {periodeUkenummerTekst}
            <span className="tekst-subtil">{periodeFomTomDatoTekst}</span>
          </p>
          <span className="navds-sr-only">{`${periodeUkenummerTekst} (${periodeFomTomDatoTekst})`}</span>
        </div>
        {rapporteringsperiode.kanKorrigeres && (
          <RedigeringsLenke id={rapporteringsperiode.id} status={rapporteringsperiode.status} />
        )}
      </div>
      <table className={styles.kalender} role="grid">
        <thead aria-hidden>
          <tr className={styles.ukedagKontainer}>
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
        <tbody
          className={classNames(styles.ukerKontainer, {
            [styles.spacing]: forsteUkeHarMinstEnAktivitet,
          })}
        >
          <Uke rapporteringUke={forsteUke} readonly={readonly} aapneModal={aapneModal} />
          <Uke rapporteringUke={andreUke} readonly={readonly} aapneModal={aapneModal} />
        </tbody>
      </table>
    </>
  );
}
