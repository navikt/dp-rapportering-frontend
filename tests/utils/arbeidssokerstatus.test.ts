// @vitest-environment node
import { describe, expect, test } from "vitest";

import {
  erArbeidssokerstatusSvarLaast,
  erKorrigertMeldekort,
  finnArbeidssokerstatusAarsak,
  hentArbeidssokerstatusAarsakskategori,
} from "~/utils/arbeidssokerstatus.utils";
import { ARBEIDSSOKERSTATUS_AARSAK, KortType } from "~/utils/types";

import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";

const {
  DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
  ETTERREGISTRERT_MELDEKORT,
  ARBEIDSSOKERPERIODEN_ER_I_FORTID,
  KORRIGERT_MELDEKORT,
} = ARBEIDSSOKERSTATUS_AARSAK;

describe("arbeidssøkerstatus-årsaker", () => {
  test.each([true, false, null])(
    "bruker type som fallback for etterregistrert legacy-svar %s",
    (svar) => {
      const periode = {
        ...rapporteringsperioderResponse[0],
        type: KortType.ETTERREGISTRERT,
        registrertArbeidssoker: svar,
      };

      expect(finnArbeidssokerstatusAarsak(periode)).toBe(ETTERREGISTRERT_MELDEKORT);
    },
  );

  test("respekterer ikke eksplisitt null-årsak i ny payload også for etterregistrert", () => {
    const periode = {
      ...rapporteringsperioderResponse[0],
      type: KortType.ETTERREGISTRERT,
      registrertArbeidssoker: false,
      sporsmalOmRegistrertArbeidssoker: { svarFraBruker: false, arsakBrukerHarIkkeSvart: null },
    };

    expect(finnArbeidssokerstatusAarsak(periode)).toBe(ETTERREGISTRERT_MELDEKORT);
  });

  test("skiller manglende ansvar fra en arbeidssøkerperiode i fortid", () => {
    expect(
      hentArbeidssokerstatusAarsakskategori(
        DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
      ),
    ).toEqual({
      viHarIkkeAnsvar: true,
      arbeidssokerperiodenErIFortid: false,
    });
  });

  test.each([ETTERREGISTRERT_MELDEKORT, ARBEIDSSOKERPERIODEN_ER_I_FORTID])(
    "klassifiserer %s som arbeidssøkerperiode i fortid",
    (aarsak) => {
      expect(hentArbeidssokerstatusAarsakskategori(aarsak)).toEqual({
        viHarIkkeAnsvar: false,
        arbeidssokerperiodenErIFortid: true,
      });
    },
  );

  test.each([
    DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
    ETTERREGISTRERT_MELDEKORT,
    ARBEIDSSOKERPERIODEN_ER_I_FORTID,
  ])("låser svaret ved årsaken %s", (aarsak) => {
    expect(erArbeidssokerstatusSvarLaast(aarsak)).toBe(true);
  });

  test.each([null, KORRIGERT_MELDEKORT])("låser ikke svaret for årsaken %s", (aarsak) => {
    expect(erArbeidssokerstatusSvarLaast(aarsak)).toBe(false);
  });
});

describe("erKorrigertMeldekort", () => {
  test.each([
    {
      ...rapporteringsperioderResponse[0],
      registrertArbeidssoker: null,
      sporsmalOmRegistrertArbeidssoker: {
        svarFraBruker: null,
        arsakBrukerHarIkkeSvart: KORRIGERT_MELDEKORT,
      },
    },
    { ...rapporteringsperioderResponse[0], type: KortType.KORRIGERT },
    { ...rapporteringsperioderResponse[0], originalId: "opprinnelig-periode" },
  ])("gjenkjenner korrigert meldekort uansett signal", (periode) => {
    expect(erKorrigertMeldekort(periode)).toBe(true);
  });

  test("gjenkjenner ikke ordinært meldekort som korrigert", () => {
    expect(erKorrigertMeldekort(rapporteringsperioderResponse[0])).toBe(false);
  });
});
