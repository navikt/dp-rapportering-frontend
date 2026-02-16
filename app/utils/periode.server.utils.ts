import { redirect } from "react-router";

import { logg } from "~/models/logger.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import { FEILTYPE, IRapporteringsperiodeStatus } from "./types";

export function redirectTilForsideHvisMeldekortIkkeKanFyllesUt(
  request: Request,
  periode: IRapporteringsperiode,
): void {
  const url = new URL(request.url);
  const path = url.pathname;

  // Identifiser route-type basert på URL-struktur
  const isBekreftelseSide = path.includes("/bekreftelse");
  const isEndrePath = path.endsWith("/endre");
  const isEndringFlow = path.includes("/endring/") && !isBekreftelseSide;
  const isNormalFlow = !path.includes("/endring") && !path.includes("/endre") && !isBekreftelseSide;

  // 1. Tillat alltid bekreftelsessider
  if (isBekreftelseSide) {
    return;
  }

  // 2. Sjekk /endre rute - krever kanEndres
  if (isEndrePath) {
    if (!periode.kanEndres) {
      logg({
        type: "warn",
        message: `Bruker prøvde å starte endring på periode som ikke kan endres, ID: ${periode.id}`,
        correlationId: null,
        body: { periodeId: periode.id, kanEndres: periode.kanEndres, url: path },
      });
      throw redirect(`/?feil=${FEILTYPE.KAN_IKKE_ENDRES}`);
    }
    return;
  }

  // 3. Sjekk endringsflyt - krever TilUtfylling (working copy)
  if (isEndringFlow) {
    if (periode.status !== IRapporteringsperiodeStatus.TilUtfylling) {
      logg({
        type: "warn",
        message: `Bruker prøvde å endre periode som ikke er i redigeringsmodus, ID: ${periode.id}`,
        correlationId: null,
        body: { periodeId: periode.id, status: periode.status, url: path },
      });
      throw redirect(`/?feil=${FEILTYPE.KAN_IKKE_ENDRES}`);
    }
    return;
  }

  // 4. Sjekk normal flyt - krever TilUtfylling (eller Feilet med kanEndres)
  if (isNormalFlow) {
    // Tillat TilUtfylling eller Feilet-perioder som kan endres
    const kanFyllesUt =
      periode.status === IRapporteringsperiodeStatus.TilUtfylling ||
      (periode.status === IRapporteringsperiodeStatus.Feilet && periode.kanEndres);

    if (!kanFyllesUt) {
      logg({
        type: "warn",
        message: `Bruker prøvde å fylle ut periode som ikke er TilUtfylling, ID: ${periode.id}`,
        correlationId: null,
        body: { periodeId: periode.id, status: periode.status, url: path },
      });
      throw redirect(`/?feil=${FEILTYPE.ALLEREDE_INNSENDT}`);
    }
  }
}
