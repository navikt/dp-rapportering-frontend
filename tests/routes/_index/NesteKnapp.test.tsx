import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, test, vi } from "vitest";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { NesteKnapp } from "~/routes/denne-kan-slettes-index/NesteKnapp";
import { Rapporteringstype } from "~/utils/types";

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: vi.fn(() => "Neste"),
    getLink: vi.fn(() => ({ linkText: "Til utfylling" })),
  }),
}));

describe("<NesteKnapp/>", () => {
  const rapporteringsPeriode: IRapporteringsperiode = { id: "123" } as IRapporteringsperiode;

  test("ikke rendere når rapporteringstype ikke er valgt", () => {
    const { queryByRole } = render(
      <MemoryRouter>
        <NesteKnapp rapporteringstype={undefined} rapporteringsPeriode={rapporteringsPeriode} />
      </MemoryRouter>
    );
    expect(queryByRole("button")).not.toBeInTheDocument();
  });

  test("rendere korrekt lenke og tekst når man har aktiviteter'", () => {
    const { getByText } = render(
      <MemoryRouter>
        <NesteKnapp
          rapporteringstype={Rapporteringstype.harAktivitet}
          rapporteringsPeriode={rapporteringsPeriode}
        />
      </MemoryRouter>
    );

    const nesteKnapp = getByText("Til utfylling");

    expect(nesteKnapp).toBeInTheDocument();
    expect(nesteKnapp.closest("a")).toHaveAttribute(
      "href",
      `/periode/${rapporteringsPeriode.id}/fyll-ut`
    );
  });

  it("skal rendere korrekt lenke og tekst når man ikke har aktiviteter'", () => {
    const { getByText } = render(
      <MemoryRouter>
        <NesteKnapp
          rapporteringstype={Rapporteringstype.harIngenAktivitet}
          rapporteringsPeriode={rapporteringsPeriode}
        />
      </MemoryRouter>
    );

    const nesteKnapp = getByText("Neste");
    expect(nesteKnapp).toBeInTheDocument();

    expect(nesteKnapp.closest("a")).toHaveAttribute(
      "href",
      `/periode/${rapporteringsPeriode.id}/send-inn`
    );
  });
});
