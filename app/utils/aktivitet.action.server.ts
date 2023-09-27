import { type TypedResponse } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { type IAction, lagreAktivitet, type TAktivitetType } from "~/models/aktivitet.server";
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
): Promise<TypedResponse | IAction> {
  const inputVerdier = await validator(aktivitetsType).validate(formdata);

  if (inputVerdier.error) {
    return validationError(inputVerdier.error);
  }

  const { type, dato, timer: varighet } = inputVerdier.submittedData;
  const aktivitetData = hentAktivitetData(type, dato, varighet);

  return await lagreAktivitet(onBehalfOfToken, periodeId, aktivitetData);
}

function hentAktivitetData(
  type: TAktivitetType,
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
