import { hentISO8601DurationString } from "./duration.utils";
import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { uuidv4 } from "uuidv7";
import { type AktivitetType, lagreAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

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
  const gjeldendeDag: IRapporteringsperiodeDag = JSON.parse(String(formdata.get("dag")));

  const aktiviteter = Array.isArray(type) ? type : [type];

  gjeldendeDag.aktiviteter = aktiviteter.map((aktivitetType) => {
    const finnesFraFor = gjeldendeDag.aktiviteter.find(
      (aktivitet) => aktivitet.type === aktivitetType
    );

    if (finnesFraFor && aktivitetType === "Arbeid") {
      finnesFraFor.timer = hentISO8601DurationString(varighet);
    }

    if (finnesFraFor) {
      return finnesFraFor;
    }

    return hentAktivitetData(aktivitetType, dato, varighet);
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
