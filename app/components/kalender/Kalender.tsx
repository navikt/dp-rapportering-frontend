import { EndringsLenke } from "./Endringslenke";
import styles from "./Kalender.module.css";
import { Uke } from "./Uke";
import classNames from "classnames";
import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { formaterPeriodeDato, getWeekDays } from "~/utils/dato.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { hentUkeTekst, kanSendes } from "~/utils/periode.utils";
import { useSanity } from "~/hooks/useSanity";

interface IProps {
  aapneModal: (dato: string) => void;
  periode: IRapporteringsperiode;
  visEndringslenke?: boolean;
  readonly?: boolean;
  locale: DecoratorLocale;
}

export function Kalender(props: IProps) {
  const { periode, aapneModal, readonly = false, visEndringslenke = false, locale } = props;
  const { getAppText } = useSanity();

  const ukedager = getWeekDays(locale);

  const { fraOgMed, tilOgMed } = periode.periode;

  const forsteUke = [...periode.dager].splice(0, 7);
  const andreUke = [...periode.dager].splice(7, 7);

  const periodeUkenummerTekst = hentUkeTekst(periode, getAppText);

  const periodeFomTomDatoTekst = formaterPeriodeDato(fraOgMed, tilOgMed);

  return (
    <>
      <div className={styles.headerKontainer}>
        <div>
          <p className={styles.header}>
            {periodeUkenummerTekst}
            <span className="tekst-subtil">{periodeFomTomDatoTekst}</span>
          </p>
        </div>
        {visEndringslenke && <EndringsLenke id={periode.id} status={periode.status} />}
      </div>
      <table
        className={styles.kalender}
        role="grid"
        aria-disabled={!kanSendes(periode) || readonly}
      >
        <thead aria-hidden>
          <tr className={styles.ukedagKontainer}>
            {ukedager.map((ukedag, index) => {
              return (
                <th scope="col" key={`${periode.id}-${index}`} className={styles.ukedag}>
                  <span>{ukedag.kort}</span>
                  <span className="navds-sr-only">{ukedag.lang}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={classNames(styles.ukerKontainer)}>
          <Uke
            rapporteringUke={forsteUke}
            readonly={readonly}
            aapneModal={aapneModal}
            locale={locale}
          />
          <Uke
            rapporteringUke={andreUke}
            readonly={readonly}
            aapneModal={aapneModal}
            locale={locale}
          />
        </tbody>
      </table>
    </>
  );
}
