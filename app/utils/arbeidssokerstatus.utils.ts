import type { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { ARBEIDSSOKERSTATUS_AARSAK, type ArbeidssokerstatusAarsak, KortType } from "~/utils/types";

export function hentArbeidssokerstatusAarsakskategori(aarsak: ArbeidssokerstatusAarsak | null) {
  return {
    viHarIkkeAnsvar:
      aarsak ===
      ARBEIDSSOKERSTATUS_AARSAK.DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
    periodenHarVaert:
      aarsak === ARBEIDSSOKERSTATUS_AARSAK.ETTERREGISTRERT_MELDEKORT ||
      aarsak === ARBEIDSSOKERSTATUS_AARSAK.ARBEIDSSOKERPERIODEN_ER_I_FORTID,
  };
}

export function erArbeidssokerstatusSvarLaast(aarsak: ArbeidssokerstatusAarsak | null): boolean {
  const { viHarIkkeAnsvar, periodenHarVaert } = hentArbeidssokerstatusAarsakskategori(aarsak);

  return viHarIkkeAnsvar || periodenHarVaert;
}

export function erKorrigertMeldekort(periode: IRapporteringsperiode): boolean {
  const aarsak =
    typeof periode.registrertArbeidssoker === "object" && periode.registrertArbeidssoker !== null
      ? periode.registrertArbeidssoker.aarsak
      : null;

  return (
    periode.type === KortType.KORRIGERT ||
    periode.originalId !== null ||
    aarsak === ARBEIDSSOKERSTATUS_AARSAK.KORRIGERT_MELDEKORT
  );
}
