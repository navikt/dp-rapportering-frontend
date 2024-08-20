import type { INetworkResponse } from "./types";
import { begrunnelseEndringValidator } from "./validering.util";
import { validationError } from "remix-validated-form";
import { lagreAktivitet } from "~/models/aktivitet.server";

export async function validerOgLagreBegrunnelse(
  request: Request,
  periodeId: string,
  formdata: FormData
): Promise<INetworkResponse> {
  const inputVerdier = await begrunnelseEndringValidator().validate(formdata);

  if (inputVerdier.error) {
    validationError(inputVerdier.error);
  }

  const { begrunnelseEndring } = inputVerdier.submittedData;

  return await lagreAktivitet(request, periodeId, begrunnelseEndring);
}
