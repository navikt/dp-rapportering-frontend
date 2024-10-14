import { EndringsLenke } from "./Endringslenke";
import styles from "./Kalender.module.css";
import { Uke } from "./Uke";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, getWeekDays } from "~/utils/dato.utils";
import { hentUkeTekst } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

interface IProps {
  aapneModal: (dato: string) => void;
  rapporteringsperiode: IRapporteringsperiode;
  visEndringslenke?: boolean;
  readonly?: boolean;
}

export function Kalender(props: IProps) {
  const { rapporteringsperiode, aapneModal, readonly = false, visEndringslenke = false } = props;
  const { locale } = useTypedRouteLoaderData("root");
  const { getAppText } = useSanity();

  const ukedager = getWeekDays(locale);

  const { fraOgMed, tilOgMed } = rapporteringsperiode.periode;

  const forsteUke = [...rapporteringsperiode.dager].splice(0, 7);
  const andreUke = [...rapporteringsperiode.dager].splice(7, 7);

  const periodeUkenummerTekst = hentUkeTekst(rapporteringsperiode, getAppText);

  const periodeFomTomDatoTekst = formaterPeriodeDato(fraOgMed, tilOgMed);

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
        {visEndringslenke && (
          <EndringsLenke id={rapporteringsperiode.id} status={rapporteringsperiode.status} />
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
        <tbody className={classNames(styles.ukerKontainer)}>
          <Uke rapporteringUke={forsteUke} readonly={readonly} aapneModal={aapneModal} />
          <Uke rapporteringUke={andreUke} readonly={readonly} aapneModal={aapneModal} />
        </tbody>
      </table>
    </>
  );
}
