import { validationError } from "remix-validated-form";

import { lagreAktivitet } from "~/models/aktivitet.server";
import { logErrorResponse } from "~/models/logger.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

import { oppdaterAktiviteter } from "./aktivitet.action.utils";
import { AktivitetType } from "./aktivitettype.utils";
import { getEnv } from "./env.utils";
import { getCorrelationId, getHeaders } from "./fetch.utils";
import type { INetworkResponse } from "./types";
import { validator } from "./validering.util";

export async function slettAlleAktiviteterForRapporteringsperioden(
  request: Request,
  rapporteringsPeriodeId: string,
): Promise<INetworkResponse> {
  const url = `${getEnv(
    "DP_RAPPORTERING_URL",
  )}/rapporteringsperiode/${rapporteringsPeriodeId}/aktiviteter`;

  const response = await fetch(url, {
    method: "delete",
    headers: await getHeaders(request),
  });

  if (!response.ok) {
    const id = await getCorrelationId(response);
    await logErrorResponse(response, `Feil ved sletting av aktiviter`);
    return {
      status: "error",
      error: {
        statusCode: response.status,
        statusText: `rapportering-feilmelding-lagre-aktivitet`, // TODO: sjekk om bruker skal få feilmelding og i så tilfelle hvilket innhold
      },
      id,
    };
  }

  return { status: "success" };
}

export async function slettAlleAktiviteterForBestemtDag(
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
