import { oppdaterAktiviteter } from "./aktivitet.action.utils";
import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { type AktivitetType, lagreAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

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
  const aktivitetTyper: AktivitetType[] = Array.isArray(type) ? type : [type];

  const oppdatertDag = oppdaterAktiviteter(gjeldendeDag, aktivitetTyper, dato, varighet);

  return await lagreAktivitet(onBehalfOfToken, periodeId, oppdatertDag);
}
