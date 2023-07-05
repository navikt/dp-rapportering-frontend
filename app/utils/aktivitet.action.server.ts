import { json } from "@remix-run/node";
import { type TAktivitetType, lagreAktivitet, sletteAktivitet } from "~/models/aktivitet.server";
import { validator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { serialize } from "tinyduration";

// Disse actionene brukes i flere routes, dermed ligger de i en util-fil.

export async function slettAktivitetAction(formdata: FormData, request: Request) {
  const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;
  const aktivitetId = formdata.get("aktivitetId") as string;

  const slettAktivitetResponse = await sletteAktivitet(
    rapporteringsperiodeId,
    aktivitetId,
    request
  );

  if (slettAktivitetResponse.ok) {
    return json({ slettet: true });
  } else {
    return json({ error: "Det har skjedd en feil ved sletting, prøv igjen." });
  }
}

export async function lagreAktivitetAction(formdata: FormData, request: Request) {
  const aktivitType = formdata.get("type") as TAktivitetType;
  const inputVerdier = await validator(aktivitType).validate(formdata);

  if (inputVerdier.error) {
    return validationError(inputVerdier.error);
  }

  const { rapporteringsperiodeId, type, dato, timer: tid } = inputVerdier.submittedData;

  function hentAktivitetArbeid() {
    const delt = tid.replace(/\./g, ",").split(",");
    const timer = delt[0] || 0;
    const minutter = delt[1] || 0;

    return {
      type,
      dato,
      timer: serialize({
        hours: timer,
        minutes: minutter * 6,
      }),
    };
  }

  const andreAktivitet = {
    type,
    dato,
  };

  const aktivitetData = aktivitType === "Arbeid" ? hentAktivitetArbeid() : andreAktivitet;

  const lagreAktivitetResponse = await lagreAktivitet(
    rapporteringsperiodeId,
    aktivitetData,
    request
  );

  if (lagreAktivitetResponse.ok) {
    return json({ lagret: true });
  } else if (lagreAktivitetResponse.status === 500) {
    return json({
      error: `${lagreAktivitetResponse.status} ${lagreAktivitetResponse.statusText} - ${lagreAktivitetResponse.url}`,
    });
  } else {
    return json({
      error: "Noe gikk feil med lagring av aktivitet, prøv igjen.",
    });
  }
}
