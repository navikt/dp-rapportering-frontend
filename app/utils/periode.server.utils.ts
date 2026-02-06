import { redirect } from "react-router";

import { logg } from "~/models/logger.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import { IRapporteringsperiodeStatus } from "./types";

function kanIkkeFyllesUt(status: IRapporteringsperiodeStatus): boolean {
  // Feilet-perioder skal kunne fylles ut hvis kanEndres er true
  // Kun Innsendt, Ferdig og Endret skal blokkeres
  return (
    status === IRapporteringsperiodeStatus.Innsendt ||
    status === IRapporteringsperiodeStatus.Ferdig ||
    status === IRapporteringsperiodeStatus.Endret
  );
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

  // Blokkér vanlige utfyllingssider hvis status er Innsendt/Ferdig/Endret
  // (Feilet-perioder skal kunne fylles ut hvis kanEndres er true)
  if (erUtfyllingsSide && kanIkkeFyllesUt(periode.status)) {
    logg({
      type: "warn",
      message: `Bruker prøvde å fylle ut periode som allerede er sendt inn, ID: ${periode.id}`,
      correlationId: null,
      body: { periodeId: periode.id, status: periode.status, url: url.pathname },
    });

    // Vanlige utfyllingssider er på nivå /periode/{id}/fyll-ut, så ../.. går til forsiden
    throw redirect(`../..?feil=allerede-behandlet&status=${periode.status}`);
  }

  // Blokkér endringsflyt-sider hvis perioden ikke kan endres
  // Tillat hvis:
  // - Status er TilUtfylling (endring pågår - typisk når startEndring() har blitt kalt)
  // - Bekreftelsessider (bruker må kunne se bekreftelse)
  if (
    erEndringsflyt &&
    !erBekreftelseSide &&
    !periode.kanEndres &&
    periode.status !== IRapporteringsperiodeStatus.TilUtfylling
  ) {
    logg({
      type: "warn",
      message: `Bruker prøvde å endre periode som ikke kan endres, ID: ${periode.id}`,
      correlationId: null,
      body: {
        periodeId: periode.id,
        status: periode.status,
        kanEndres: periode.kanEndres,
        url: url.pathname,
      },
    });

    // Endringsflyt-sider er på nivå /periode/{id}/endring/send-inn, så ../../.. går til forsiden
    throw redirect(`../../..?feil=kan-ikke-endres&status=${periode.status}`);
  }
}
