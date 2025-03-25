import { slettAlleAktiviteter } from "~/models/aktiviteter.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import { INetworkResponse } from "./types";

export async function slettAlleAktiviteterForEnHelPeriode(
  request: Request,
  rapporteringsPeriode: IRapporteringsperiode,
): Promise<INetworkResponse> {
  return await slettAlleAktiviteter(request, rapporteringsPeriode);
}
