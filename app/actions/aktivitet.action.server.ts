import { validationError } from "remix-validated-form";

import { lagreAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

import { oppdaterAktiviteter } from "../utils/aktivitet.utils";
import { AktivitetType } from "../utils/aktivitettype.utils";
import type { INetworkResponse } from "../utils/types";
import { validator } from "../utils/validering.util";

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
