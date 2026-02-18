import { redirect } from "react-router";

import { logg } from "~/models/logger.server";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

import { IRapporteringsperiodeStatus } from "./types";

export function redirectTilForsideHvisMeldekortIkkeKanFyllesUt(
  request: Request,
  periode: IRapporteringsperiode,
): void {
  const url = new URL(request.url);
  const path = url.pathname;

  // Klassifiser URL-sti for å identifisere hvilken type side brukeren prøver å nå
  const isBekreftelseSide = path.includes("/bekreftelse");
  const isEndrePath = path.endsWith("/endre");
  const isEndringFlow =
    (path.includes("/endring/") || path.endsWith("/endring")) && !isBekreftelseSide;
  const isNormalFlow = !path.includes("/endring") && !path.includes("/endre") && !isBekreftelseSide;

  // 1. Bekreftelsessider skal alltid være tilgjengelige
  // Brukere må kunne se bekreftelse etter innsending/endring uavhengig av periodestatus
  if (isBekreftelseSide) {
    return;
  }

  // 2. /endre-ruten starter endringsflyt for innsendte meldekort
  // Denne ruten mottar original periode-ID (eks: ID=123) og validerer kanEndres
  // Ved godkjent endring opprettes det en ny working copy med TilUtfylling-status (eks: ID=456)
  // Bruker redirectes deretter til /endring/* med det nye working copy-ID-et
  if (isEndrePath) {
    if (!periode.kanEndres) {
      logg({
        type: "warn",
        message: `Bruker prøvde å starte endring på periode som ikke kan endres, ID: ${periode.id}`,
        correlationId: null,
        body: { periodeId: periode.id, kanEndres: periode.kanEndres, url: path },
      });
      throw redirect("/");
    }
    return;
  }

  // 3. Endringsflyt-sider (/endring/* og /endring) krever at perioden er i redigeringsmodus
  // Disse sidene mottar working copy-ID (eks: ID=456) opprettet av /endre-ruten
  // Working copy har alltid status=TilUtfylling og kan redigeres
  // Hvis status ikke er TilUtfylling, er dette en ugyldig working copy eller utdatert URL
  if (isEndringFlow) {
    if (periode.status !== IRapporteringsperiodeStatus.TilUtfylling) {
      logg({
        type: "warn",
        message: `Bruker prøvde å endre periode som ikke er i redigeringsmodus, ID: ${periode.id}`,
        correlationId: null,
        body: { periodeId: periode.id, status: periode.status, url: path },
      });
      throw redirect("/");
    }
    return;
  }

  // 4. Vanlig utfylling krever status TilUtfylling
  // Blokkerer tilgang til utfyllingssider for perioder som er Innsendt, Ferdig, Endret, eller Feilet
  if (isNormalFlow) {
    if (periode.status !== IRapporteringsperiodeStatus.TilUtfylling) {
      logg({
        type: "warn",
        message: `Bruker prøvde å fylle ut periode som ikke er TilUtfylling, ID: ${periode.id}`,
        correlationId: null,
        body: { periodeId: periode.id, status: periode.status, url: path },
      });
      throw redirect("/");
    }
  }
}
