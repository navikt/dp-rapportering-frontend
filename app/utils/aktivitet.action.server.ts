import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { lagreAktivitet, type AktivitetType } from "~/models/aktivitet.server";
import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";

interface IAktivtetData {
  type: AktivitetType;
  dato: string;
}

interface IAktivitetArbeidData extends IAktivtetData {
  timer: string;
}

export async function validerOgLagreAktivitet(
  onBehalfOfToken: string,
  aktivitetsType: AktivitetType,
  periodeId: string,
  formdata: FormData
): Promise<INetworkResponse> {
  const inputVerdier = await validator(aktivitetsType).validate(formdata);

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
