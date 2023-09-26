import { type TypedResponse } from "@remix-run/node";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { IAktivitetResponse, lagreAktivitet, type TAktivitetType } from "~/models/aktivitet.server";
import { validator } from "./validering.util";

export async function validerOgLagreAktivitet(
  onBehalfOfToken: string,
  periodeId: string,
  formdata: FormData
): Promise<TypedResponse | IAktivitetResponse> {
  const aktivitetsType = formdata.get("type") as TAktivitetType;
  const inputVerdier = await validator(aktivitetsType).validate(formdata);

  if (inputVerdier.error) {
    return validationError(inputVerdier.error);
  }

  const { type, dato, timer: tid } = inputVerdier.submittedData;

  function hentAktivitetArbeid() {
    const delt = tid.replace(/\./g, ",").split(",");
    const timer = delt[0] || 0;
    const minutter = delt[1] || 0;
    const minutterProsent = parseFloat(`0.${minutter}`);

    return {
      type,
      dato,
      timer: serialize({
        hours: timer,
        minutes: Math.round(minutterProsent * 60),
      }),
    };
  }

  const andreAktivitet = {
    type,
    dato,
  };

  const aktivitetData = aktivitetsType === "Arbeid" ? hentAktivitetArbeid() : andreAktivitet;

  return await lagreAktivitet(onBehalfOfToken, periodeId, aktivitetData);
}
