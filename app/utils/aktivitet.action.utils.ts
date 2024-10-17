import { AktivitetType } from "./aktivitettype.utils";
import { hentISO8601DurationString } from "./duration.utils";
import { uuidv7 } from "uuidv7";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

interface IAktivtetData {
  id?: string;
  type: AktivitetType;
  dato: string;
}

interface IAktivitetArbeidData extends IAktivtetData {
  timer: string;
}

export function oppdaterAktiviteter(
  dag: IRapporteringsperiodeDag,
  aktivitetsTyper: AktivitetType[],
  dato: string,
  varighet: string
): IRapporteringsperiodeDag {
  const filtrerteAktiviteter = dag.aktiviteter.filter((aktivitet) =>
    aktivitetsTyper.includes(aktivitet.type)
  );

  const oppdaterteAktiviteter = filtrerteAktiviteter.map((aktivitet) => {
    if (aktivitet.type === "Arbeid") {
      return { ...aktivitet, timer: hentISO8601DurationString(varighet) };
    }
    return aktivitet;
  });

  aktivitetsTyper.forEach((aktivitetType) => {
    if (!oppdaterteAktiviteter.some((aktivitet) => aktivitet.type === aktivitetType)) {
      const nyAktivitet = hentAktivitetData(aktivitetType, dato, varighet);
      oppdaterteAktiviteter.push(nyAktivitet);
    }
  });

  return {
    ...dag,
    aktiviteter: oppdaterteAktiviteter,
  };
}

function hentAktivitetData(
  type: AktivitetType,
  dato: string,
  varighet: string
): IAktivitetArbeidData | IAktivtetData {
  if (type === "Arbeid") {
    return {
      id: uuidv7(),
      type,
      dato,
      timer: hentISO8601DurationString(varighet),
    };
  }

  return {
    id: uuidv7(),
    type,
    dato,
  };
}
