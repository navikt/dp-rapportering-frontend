import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { type AktivitetType, lagreAktivitet } from "~/models/aktivitet.server";

interface IAktivtetData {
  type: AktivitetType;
  dato: string;
}

interface IAktivitetArbeidData extends IAktivtetData {
  timer: string;
}

// TODO: Denne funksjonen forventer at aktivitetType er en string, mens det er en liste med strings
// Den må endres slik at den oppretter en aktivtet for hver aktivitet i listen

export async function validerOgLagreAktivitet(
  onBehalfOfToken: string,
  periodeId: string,
  formdata: FormData
): Promise<INetworkResponse> {
  const inputVerdier = await validator().validate(formdata);

  if (inputVerdier.error) {
    validationError(inputVerdier.error);
  }

  const { type, dato, timer: varighet } = inputVerdier.submittedData;
  const aktivitetData = hentAktivitetData(type, dato, varighet);

  return await lagreAktivitet(onBehalfOfToken, periodeId, aktivitetData);
}

function hentAktivitetData(
  type: AktivitetType,
  dato: string,
  varighet: string
): IAktivitetArbeidData | IAktivtetData {
  if (type === "Arbeid") {
    return {
      type,
      dato,
      timer: hentISO8601DurationString(varighet),
    };
  }

  return { type, dato };
}

function hentISO8601DurationString(varighet: string): string {
  const delt = varighet.replace(/\./g, ",").split(",");
  const timer = delt[0] || 0;
  const minutter = delt[1] || 0;
  const minutterProsent = parseFloat(`0.${minutter}`);

  return serialize({
    hours: timer as number,
    minutes: Math.round(minutterProsent * 60),
  });
}
