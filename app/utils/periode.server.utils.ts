import { redirect } from "react-router";

import { logg } from "~/models/logger.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import { IRapporteringsperiodeStatus } from "./types";

function kanIkkeFyllesUt(status: IRapporteringsperiodeStatus): boolean {
  return status !== IRapporteringsperiodeStatus.TilUtfylling;
}

export function redirectTilForsideHvisMeldekortIkkeKanFyllesUt(
  request: Request,
  periode: IRapporteringsperiode,
): void {
  const url = new URL(request.url);
  const pathSegments = url.pathname.split("/");

  const erBekreftelseSide = pathSegments.includes("bekreftelse");
  const erEndringsflyt = pathSegments.includes("endring");
  const erStartEndring = pathSegments.includes("endre");
  const erUtfyllingsSide = !erBekreftelseSide && !erEndringsflyt && !erStartEndring;

  if (erUtfyllingsSide && kanIkkeFyllesUt(periode.status)) {
    logg({
      type: "warn",
      message: `Bruker prøvde å fylle ut periode som ikke er TilUtfylling, ID: ${periode.id}`,
      correlationId: null,
      body: { periodeId: periode.id, status: periode.status, url: url.pathname },
    });

    throw redirect("../");
  }
}
