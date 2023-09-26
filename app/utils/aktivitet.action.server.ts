import { type TypedResponse } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { type IActionData, lagreAktivitet, type TAktivitetType } from "~/models/aktivitet.server";
import { validator } from "./validering.util";

interface IAktivtetData {
  type: TAktivitetType;
  dato: string;
}

interface IAktivitetArbeidData extends IAktivtetData {
  timer: string;
}

export async function validerOgLagreAktivitet(
  onBehalfOfToken: string,
  aktivitetsType: TAktivitetType,
  periodeId: string,
  formdata: FormData
): Promise<TypedResponse | IActionData> {
  const inputVerdier = await validator(aktivitetsType).validate(formdata);

  if (inputVerdier.error) {
    return validationError(inputVerdier.error);
  }

  const { type, dato, timer: tidsstempel } = inputVerdier.submittedData;
  const aktivitetData = hentAktivitetData(type, dato, tidsstempel);

  return await lagreAktivitet(onBehalfOfToken, periodeId, aktivitetData);
}

function hentAktivitetData(
  type: TAktivitetType,
  dato: string,
  tidsstempel: string
): IAktivitetArbeidData | IAktivtetData {
  if (type === "Arbeid") {
    return {
      type,
      dato,
      timer: hentISO8601DurationString(tidsstempel),
    };
  }

  return { type, dato };
}

function hentISO8601DurationString(tidsstempel: string): string {
  const delt = tidsstempel.replace(/\./g, ",").split(",");
  const timer = delt[0] || 0;
  const minutter = delt[1] || 0;
  const minutterProsent = parseFloat(`0.${minutter}`);

  return serialize({
    hours: timer as number,
    minutes: Math.round(minutterProsent * 60),
  });
}
