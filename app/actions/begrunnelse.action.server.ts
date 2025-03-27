import { validationError } from "remix-validated-form";

import { lagreAktivitet } from "~/models/aktivitet.server";
import { INetworkResponse } from "~/utils/types";
import { begrunnelseEndringValidator } from "~/utils/validering.util";

export async function validerOgLagreBegrunnelse(
  request: Request,
  periodeId: string,
  formdata: FormData,
): Promise<INetworkResponse> {
  const inputVerdier = await begrunnelseEndringValidator().validate(formdata);

  if (inputVerdier.error) {
    validationError(inputVerdier.error);
  }

  const { begrunnelseEndring } = inputVerdier.submittedData;

  return await lagreAktivitet(request, periodeId, begrunnelseEndring);
}
