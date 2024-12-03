import { validationError } from "remix-validated-form";

import { lagreAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

import { oppdaterAktiviteter } from "./aktivitet.action.utils";
import { AktivitetType } from "./aktivitettype.utils";
import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";

export async function slettAlleAktiviteter(
  request: Request,
  periodeId: string,
  formdata: FormData,
): Promise<INetworkResponse> {
  const dag: IRapporteringsperiodeDag = JSON.parse(String(formdata.get("dag")));

  const oppdatertDag = { ...dag, aktiviteter: [] };

  return await lagreAktivitet(request, periodeId, oppdatertDag);
}

export async function validerOgLagreAktivitet(
  request: Request,
  periodeId: string,
  formdata: FormData,
): Promise<INetworkResponse> {
  const inputVerdier = await validator().validate(formdata);

  if (inputVerdier.error) {
    validationError(inputVerdier.error);
  }

  const { dato, timer: varighet } = inputVerdier.submittedData;
  const type = inputVerdier.submittedData.type || [];

  const dag: IRapporteringsperiodeDag = JSON.parse(String(formdata.get("dag")));
  const aktivitetTyper: AktivitetType[] = Array.isArray(type) ? type : [type];

  const oppdatertDag = oppdaterAktiviteter(dag, aktivitetTyper, dato, varighet);

  return await lagreAktivitet(request, periodeId, oppdatertDag);
}
