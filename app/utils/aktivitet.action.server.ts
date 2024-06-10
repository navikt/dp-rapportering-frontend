import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { uuidv4 } from "uuidv7";
import { type AktivitetType, lagreAktivitet } from "~/models/aktivitet.server";

interface IAktivtetData {
  id?: string;
  type: AktivitetType;
  dato: string;
}

interface IAktivitetArbeidData extends IAktivtetData {
  timer: string;
}

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
  const gjeldendeDag = JSON.parse(String(formdata.get("dag")));

  const aktiviteter = Array.isArray(type) ? type : [type];
  aktiviteter.forEach((aktivitetType) => {
    const aktivitetData = hentAktivitetData(aktivitetType, dato, varighet);
    gjeldendeDag.aktiviteter.push(aktivitetData);
  });

  return await lagreAktivitet(onBehalfOfToken, periodeId, gjeldendeDag);
}

function hentAktivitetData(
  type: AktivitetType,
  dato: string,
  varighet: string
): IAktivitetArbeidData | IAktivtetData {
  if (type === "Arbeid") {
    return {
      id: uuidv4(),
      type,
      dato,
      timer: hentISO8601DurationString(varighet),
    };
  }

  return {
    id: uuidv4(),
    type,
    dato,
  };
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
