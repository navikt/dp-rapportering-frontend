import { type TypedResponse, json } from "@remix-run/node";
import { type TAktivitetType, lagreAktivitet, sletteAktivitet } from "~/models/aktivitet.server";
import { validator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";
import { getRapporteringOboToken } from "./auth.utils.server";

export async function slettAktivitetAction(
  formdata: FormData,
  request: Request,
  periodeId: string
): Promise<TypedResponse> {
  const aktivitetId = formdata.get("aktivitetId") as string;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const slettAktivitetResponse = await sletteAktivitet(onBehalfOfToken, periodeId, aktivitetId);

  if (!slettAktivitetResponse.ok) {
    return json({ error: "Det har skjedd en feil ved sletting, prøv igjen." });
  }

  return json({ lagret: true });
}

export async function lagreAktivitetAction(
  formdata: FormData,
  request: Request,
  periodeId: string
): Promise<TypedResponse> {
  const aktivitetsType = formdata.get("type") as TAktivitetType;
  const onBehalfOfToken = await getRapporteringOboToken(request);
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

  const lagreAktivitetResponse = await lagreAktivitet(onBehalfOfToken, periodeId, aktivitetData);

  if (!lagreAktivitetResponse.ok) {
    return json({ error: "Noen gikk feil med lagring av aktivitet, prøv igjen." });
  }

  return json({ lagret: true });
}
