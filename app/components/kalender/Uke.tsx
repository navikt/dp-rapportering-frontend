import styles from "./Kalender.module.css";
import { hentAktivitetSummenTekst, hentSkjermleserDatoTekst } from "./kalender.utils";
import classNames from "classnames";
import { format } from "date-fns";
import { AktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { useSanity } from "~/hooks/useSanity";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

interface IProps {
  aapneModal: (dato: string) => void;
  readonly?: boolean;
  rapporteringUke: IRapporteringsperiodeDag[];
  spacing?: boolean;
}

export function Uke(props: IProps) {
  const { locale } = useTypedRouteLoaderData("root");
  const { rapporteringUke, readonly, aapneModal, spacing } = props;
  const { getAppText } = useSanity();

  function erAktivStil(dag: IRapporteringsperiodeDag, typer: AktivitetType[]): boolean {
    const dagenHarAktivitet = dag.aktiviteter.length > 0;

    if (!dagenHarAktivitet) return false;

    const alleTyperErTilstede = typer.map((type) =>
      dag.aktiviteter.some((aktivitet) => aktivitet.type === type)
    );

    return alleTyperErTilstede.every((type) => type === true);
  }

  return (
    <tr
      className={classNames(styles.ukeRadKontainer, {
        [styles.spacing]: spacing,
      })}
    >
      {rapporteringUke.map((dag) => {
        const dagenHarAktivitet = dag.aktiviteter.length > 0;

        const ikkeRapporteringspliktig = false;

        const dagKnappStyle = {
          [styles.arbeid]: erAktivStil(dag, ["Arbeid"]),
          [styles.sykdom]: erAktivStil(dag, ["Syk"]),
          [styles.fravaer]: erAktivStil(dag, ["Fravaer"]),
          [styles.utdanning]: erAktivStil(dag, ["Utdanning"]),
          [styles.arbeidOgUtdanning]: erAktivStil(dag, ["Arbeid", "Utdanning"]),
          [styles.sykOgUtdanning]: erAktivStil(dag, ["Syk", "Utdanning"]),
          [styles.fravaerOgUtdanning]: erAktivStil(dag, ["Fravaer", "Utdanning"]),
          [styles.sykOgFravaer]: erAktivStil(dag, ["Syk", "Fravaer"]),
          [styles.sykFravaerOgUtdanning]: erAktivStil(dag, ["Syk", "Fravaer", "Utdanning"]),
        };

        return (
          <td key={dag.dagIndex} className={styles.datoKontainer}>
            {readonly && (
              <span className={classNames(styles.dato, dagKnappStyle, styles.readonly)}>
                {`${format(new Date(dag.dato), "d")}. `}
              </span>
            )}

            {ikkeRapporteringspliktig && !readonly && (
              <button
                className={classNames(styles.dato, styles.ikkeRapporteringspliktig)}
                aria-label={hentSkjermleserDatoTekst(dag, getAppText, locale)}
                disabled
              >
                {`${format(new Date(dag.dato), "d")}.`}
              </button>
            )}

            {!ikkeRapporteringspliktig && !readonly && (
              <button
                className={classNames(styles.dato, dagKnappStyle)}
                aria-label={hentSkjermleserDatoTekst(dag, getAppText, locale)}
                onClick={() => aapneModal(dag.dato)}
              >
                {`${format(new Date(dag.dato), "d")}.`}
              </button>
            )}

            {dagenHarAktivitet && erAktivStil(dag, ["Arbeid"]) && (
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
