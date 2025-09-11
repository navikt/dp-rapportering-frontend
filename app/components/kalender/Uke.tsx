import classNames from "classnames";

import { useSanity } from "~/hooks/useSanity";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { formaterDato } from "~/utils/dato.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";

import styles from "./Kalender.module.css";
import { hentAktivitetSummenTekst, hentSkjermleserDatoTekst } from "./kalender.utils";

interface IProps {
  aapneModal: (dato: string) => void;
  readonly?: boolean;
  rapporteringUke: IRapporteringsperiodeDag[];
  locale: DecoratorLocale;
  periodeId: string;
}

export function Uke(props: IProps) {
  const { rapporteringUke, readonly, aapneModal, locale = DecoratorLocale.NB } = props;
  const { getAppText } = useSanity();

  function erAktivStil(dag: IRapporteringsperiodeDag, typer: AktivitetType[]): boolean {
    const dagenHarAktivitet = dag.aktiviteter.length > 0;

    if (!dagenHarAktivitet) return false;

    const alleTyperErTilstede = typer.map((type) =>
      dag.aktiviteter.some((aktivitet) => aktivitet.type === type),
    );

    return alleTyperErTilstede.every((type) => type === true);
  }

  return (
    <tr className={styles.ukeRadKontainer}>
      {rapporteringUke.map((dag) => {
        const dagenHarAktivitet = dag.aktiviteter.length > 0;

        const dagKnappStyle = {
          [styles.arbeid]: erAktivStil(dag, [AktivitetType.Arbeid]),
          [styles.sykdom]: erAktivStil(dag, [AktivitetType.Syk]),
          [styles.fravaer]: erAktivStil(dag, [AktivitetType.Fravaer]),
          [styles.utdanning]: erAktivStil(dag, [AktivitetType.Utdanning]),
          [styles.arbeidOgUtdanning]: erAktivStil(dag, [
            AktivitetType.Arbeid,
            AktivitetType.Utdanning,
          ]),
          [styles.sykOgUtdanning]: erAktivStil(dag, [AktivitetType.Syk, AktivitetType.Utdanning]),
          [styles.fravaerOgUtdanning]: erAktivStil(dag, [
            AktivitetType.Fravaer,
            AktivitetType.Utdanning,
          ]),
          [styles.sykOgFravaer]: erAktivStil(dag, [AktivitetType.Syk, AktivitetType.Fravaer]),
          [styles.sykFravaerOgUtdanning]: erAktivStil(dag, [
            AktivitetType.Syk,
            AktivitetType.Fravaer,
            AktivitetType.Utdanning,
          ]),
        };

        return (
          <td key={dag.dagIndex} className={styles.datoKontainer}>
            {readonly && (
              <span
                className={classNames(styles.dato, dagKnappStyle, styles.readonly)}
                aria-label={hentSkjermleserDatoTekst(dag, getAppText, locale)}
              >
                {`${formaterDato({ dato: dag.dato, dateFormat: "d" })}. `}
              </span>
            )}

            {!readonly && (
              <button
                className={classNames(styles.dato, dagKnappStyle)}
                aria-label={hentSkjermleserDatoTekst(dag, getAppText, locale)}
                onClick={() => {
                  aapneModal(dag.dato);
                }}
              >
                {`${formaterDato({ dato: dag.dato, dateFormat: "d" })}.`}
              </button>
            )}

            {dagenHarAktivitet && erAktivStil(dag, [AktivitetType.Arbeid]) && (
              <div className={classNames(styles.datoMedAktivitet)} aria-hidden>
                {hentAktivitetSummenTekst(dag, getAppText)}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}
