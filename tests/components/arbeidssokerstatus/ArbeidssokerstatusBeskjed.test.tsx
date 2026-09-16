import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, test } from "vitest";

import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";

import { innsendtRapporteringsperioderResponse } from "../../../mocks/responses/innsendtRapporteringsperioderResponse";

describe("ArbeidssokerstatusBeskjed", () => {
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
