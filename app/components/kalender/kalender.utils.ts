import { IAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";

// TODO: Denne må Sanityfiseres

export function hentAktivitetSummenTekst(dag: IRapporteringsperiodeDag, lang?: boolean) {
  const arbeid = dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid");

  if (arbeid) {
    const timer = dag.aktiviteter.reduce((accumulator, current) => {
      if (current.timer) {
        return accumulator + (periodeSomTimer(current.timer) ?? 0);
      }
      return accumulator;
    }, 0);

    return `${timer.toString().replace(/\./g, ",")}${lang ? " timer" : "t"}`;
  } else {
    return lang ? "1 dag" : "1d";
  }
}

export function hentAktivitetSumTekst(aktivitet: IAktivitet, lang?: boolean) {
  if (aktivitet.timer) {
    return `${(periodeSomTimer(aktivitet.timer) ?? 0).toString().replace(/\./g, ",")}${lang ? " timer" : "t"}`;
  }

  return lang ? "1 dag" : "1d";
}

export function hentSkjermleserDatoTekst(dag: IRapporteringsperiodeDag) {
  const locale = "no-NO";
  const lf = new Intl.ListFormat(locale);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    weekday: "long",
    month: "long",
  };

  const formattertDato = new Date(dag.dato).toLocaleDateString(locale, options);

  const aktiviteter = dag.aktiviteter.map(
    (aktivitet) => `${aktivitet.type} ${hentAktivitetSumTekst(aktivitet, true)}`
  );

  if (aktiviteter.length === 0) {
    return formattertDato;
  }

  return `${formattertDato}, ${lf.format(aktiviteter)}`;
}
