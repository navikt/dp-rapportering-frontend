import styles from "./Kalender.module.css";
import classNames from "classnames";
import { format } from "date-fns";
import { AktivitetType } from "~/models/aktivitet.server";
import type { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";

interface IProps {
  aapneModal: (dato: string) => void;
  readonly?: boolean;
  rapporteringUke: IRapporteringsperiodeDag[];
  spacing?: boolean;
}

export function Uke(props: IProps) {
  const { rapporteringUke, readonly, aapneModal, spacing } = props;

  function hentAktivitetSummenTekst(dag: IRapporteringsperiodeDag, lang?: boolean) {
    const arbeid = dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid");

    if (arbeid) {
      const timer = dag.aktiviteter.reduce((accumulator, current) => {
        if (current.timer) {
          return accumulator + periodeSomTimer(current.timer);
        }
        return accumulator + 1;
      }, 0);

      return `${timer.toString().replace(/\./g, ",")}${lang ? " timer" : "t"}`;
    } else {
      return lang ? "1 dag" : "1d";
    }
  }

  function hentSkjermleserDatoTekst(dag: IRapporteringsperiodeDag) {
    const locale = "no-NO";

    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      weekday: "long",
      month: "long",
    };

    const formattertDato = new Date(dag.dato).toLocaleDateString(locale, options);

    if (dag.aktiviteter.length > 0) {
      const aktivitetType = dag.aktiviteter[0].type;
      return `${formattertDato}, ${aktivitetType} ${hentAktivitetSummenTekst(dag, true)}`;
    }

    return formattertDato;
  }

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
        };

        return (
          <td key={dag.dagIndex} className={styles.datoKontainer}>
            {readonly && (
              <span
                className={classNames(styles.dato, dagKnappStyle, styles.readonly)}
              >{`${format(new Date(dag.dato), "dd")}. `}</span>
            )}

            {ikkeRapporteringspliktig && !readonly && (
              <button
                className={classNames(styles.dato, styles.ikkeRapporteringspliktig)}
                aria-label={hentSkjermleserDatoTekst(dag)}
                disabled
              >
                {`${format(new Date(dag.dato), "dd")}.`}
              </button>
            )}

            {!ikkeRapporteringspliktig && !readonly && (
              <button
                className={classNames(styles.dato, dagKnappStyle)}
                aria-label={hentSkjermleserDatoTekst(dag)}
                onClick={() => aapneModal(dag.dato)}
              >
                {`${format(new Date(dag.dato), "dd")}.`}
              </button>
            )}

            {dagenHarAktivitet && (
              <div
                className={classNames(styles.datoMedAktivitet, {
                  [styles.datoMedAktivitetSykdom]: erAktivStil(dag, ["Syk"]),
                  [styles.datoMedAktivitetFerie]: erAktivStil(dag, ["Fravaer"]),
                  [styles.datoMedAktivitetUtdanning]: erAktivStil(dag, ["Utdanning"]),
                  [styles.datoMedAktivitetArbeidOgUtdanning]: erAktivStil(dag, [
                    "Arbeid",
                    "Utdanning",
                  ]),
                })}
                aria-hidden
              >
                {hentAktivitetSummenTekst(dag)}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}
