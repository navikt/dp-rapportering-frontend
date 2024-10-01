import { IAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { periodeSomTimer } from "~/utils/periode.utils";
import type { GetAppText } from "~/hooks/useSanity";

export function hentAktivitetSummenTekst(
  dag: IRapporteringsperiodeDag,
  getAppText: GetAppText,
  lang?: boolean
) {
  const arbeid = dag.aktiviteter.some((aktivitet) => aktivitet.type === "Arbeid");

  if (arbeid) {
    const timer = dag.aktiviteter.reduce((accumulator, current) => {
      if (current.timer) {
        return accumulator + (periodeSomTimer(current.timer) ?? 0);
      }
      return accumulator;
    }, 0);

    return `${timer.toString().replace(/\./g, ",")}${lang ? ` ${getAppText("rapportering-timer")}` : getAppText("rapportering-time-kort")}`;
  } else {
    return lang ? `1 ${getAppText("rapportering-dag")}` : `1${getAppText("rapportering-dag-kort")}`;
  }
}

export function hentAktivitetSumTekst(
  aktivitet: IAktivitet,
  getAppText: GetAppText,
  lang?: boolean
) {
  if (aktivitet.timer) {
    const timer = periodeSomTimer(aktivitet.timer) ?? 0;
    const langTekst =
      timer === 1 ? getAppText("rapportering-time") : getAppText("rapportering-timer");
    return `${timer.toString().replace(/\./g, ",")}${lang ? ` ${langTekst}` : getAppText("rapportering-time-kort")}`;
  }

  return lang ? `1 ${getAppText("rapportering-dag")}` : `1${getAppText("rapportering-dag-kort")}`;
}

export function hentSkjermleserDatoTekst(
  dag: IRapporteringsperiodeDag,
  getAppText: GetAppText,
  locale: string = "no-NO"
) {
  const lf = new Intl.ListFormat(locale);

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    weekday: "long",
    month: "long",
  };

  const formattertDato = new Date(dag.dato).toLocaleDateString(locale, options);

  const aktiviteter = dag.aktiviteter.map(
    (aktivitet) => `${aktivitet.type} ${hentAktivitetSumTekst(aktivitet, getAppText, true)}`
  );

  if (aktiviteter.length === 0) {
    return formattertDato;
  }

  return `${formattertDato}, ${lf.format(aktiviteter)}`;
}
