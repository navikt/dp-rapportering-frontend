import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { describe, expect, test, vi } from "vitest";

vi.mock("~/utils/sanity.utils", async (importOriginal) => {
  const actual = await importOriginal<typeof import("~/utils/sanity.utils")>();
  return {
    ...actual,
    sanityRichText: (value: Parameters<typeof actual.sanityRichText>[0], field: string) =>
      actual.sanityRichText(value, field, false),
  };
});

import { ArbeidssokerstatusBeskjed } from "~/components/arbeidssokerstatus/ArbeidssokerstatusBeskjed";

import { innsendtRapporteringsperioderResponse } from "../../../mocks/responses/innsendtRapporteringsperioderResponse";

describe("ArbeidssokerstatusBeskjed i produksjon", () => {
  test("viser ikke kortet når rich text mangler", () => {
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

    expect(screen.queryByText(/Mangler Sanity/)).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
