import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, test } from "vitest";

import {
  ArbeidssokerstatusBeskjed,
  hentArbeidssokerstatusInnhold,
} from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";
import { ARBEIDSSOKERSTATUS_AARSAK, KortType } from "~/utils/types";

import { innsendtRapporteringsperioderResponse } from "../../../mocks/responses/innsendtRapporteringsperioderResponse";

describe("ArbeidssokerstatusBeskjed", () => {
  test.each([
    [
      ARBEIDSSOKERSTATUS_AARSAK.DAGPENGER_HAR_IKKE_ANSVAR_FOR_SPORSMAL_OM_ARBEIDSSOKERSTATUS,
      "utfylling",
      "arbeidssokerstatusBeskjeder.viHarIkkeAnsvar",
    ],
    [
      ARBEIDSSOKERSTATUS_AARSAK.ETTERREGISTRERT_MELDEKORT,
      "bekreftelse",
      "arbeidssokerstatusBeskjeder.periodenErGammel",
    ],
    [
      ARBEIDSSOKERSTATUS_AARSAK.ARBEIDSSOKERPERIODEN_ER_I_FORTID,
      "bekreftelse",
      "arbeidssokerstatusBeskjeder.periodenErGammel",
    ],
  ] as const)("velger Sanity-felt for årsak %s på %s", (aarsak, side, felt) => {
    const periode = {
      ...innsendtRapporteringsperioderResponse[0],
      registrertArbeidssoker: null,
      sporsmalOmRegistrertArbeidssoker: { svarFraBruker: null, arsakBrukerHarIkkeSvart: aarsak },
    };

    expect(hentArbeidssokerstatusInnhold(periode, side, undefined, true).felt).toBe(felt);
  });

  test("viser fortidsbeskjed for etterregistrert legacy-svar når flagget er på", () => {
    const periode = {
      ...innsendtRapporteringsperioderResponse[0],
      type: KortType.ETTERREGISTRERT,
      registrertArbeidssoker: true,
    };

    const innhold = hentArbeidssokerstatusInnhold(periode, "utfylling", undefined, true);

    expect(innhold.felt).toBe("arbeidssokerstatusBeskjeder.periodenErGammel");
  });

  test("viser faktisk ja-svar for ny etterregistrert payload uten årsak", () => {
    const periode = {
      ...innsendtRapporteringsperioderResponse[0],
      type: KortType.ETTERREGISTRERT,
      registrertArbeidssoker: true,
      sporsmalOmRegistrertArbeidssoker: { svarFraBruker: true, arsakBrukerHarIkkeSvart: null },
    };

    const innhold = hentArbeidssokerstatusInnhold(periode, "utfylling", undefined, true);

    expect(innhold.felt).toBe("arbeidssokerstatusBeskjeder.periodenErGammel");
  });

  test("viser diagnostisk tekst når Sanity rich text mangler", async () => {
    const periode = {
      ...innsendtRapporteringsperioderResponse[0],
      registrertArbeidssoker: true,
    };
    const RoutesStub = createRoutesStub([
      {
        id: "root",
        path: "/",
        loader: () => ({
          sanityTekst: {
            arbeidssokerstatusBeskjeder: {
              duVilVaereRegistrert: null,
            },
          },
        }),
        Component: () => <ArbeidssokerstatusBeskjed periode={periode} side="utfylling" />,
      },
    ]);

    render(<RoutesStub initialEntries={["/"]} />);

    expect(
      await screen.findByText(/Mangler Sanity: arbeidssokerstatusBeskjeder\.duVilVaereRegistrert/),
    ).toBeInTheDocument();
  });
});
