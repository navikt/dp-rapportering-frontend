import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, test, vi } from "vitest";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { NextButton } from "~/routes/_index/NextButton";
import { Rapporteringstype } from "~/hooks/useRapporteringstype";

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: vi.fn(() => "Neste"),
    getLink: vi.fn(() => ({ linkText: "Til utfylling" })),
  }),
}));

describe("NextButton Komponent", () => {
  const rapporteringsPeriode: IRapporteringsperiode = { id: "123" } as IRapporteringsperiode;

  test("ikke rendere når rapporteringstype ikke er valgt", () => {
    const { queryByRole } = render(
      <MemoryRouter>
        <NextButton rapporteringstype={undefined} rapporteringsPeriode={rapporteringsPeriode} />
      </MemoryRouter>
    );
    expect(queryByRole("button")).not.toBeInTheDocument();
  });

  test("rendere korrekt lenke og tekst når man har aktiviteter'", () => {
    const { getByText } = render(
      <MemoryRouter>
        <NextButton
          rapporteringstype={Rapporteringstype.harAktivitet}
          rapporteringsPeriode={rapporteringsPeriode}
        />
      </MemoryRouter>
    );

    const nextButton = getByText("Til utfylling");

    expect(nextButton).toBeInTheDocument();
    expect(nextButton.closest("a")).toHaveAttribute(
      "href",
      `/periode/${rapporteringsPeriode.id}/fyll-ut`
    );
  });

  it("skal rendere korrekt lenke og tekst når man ikke har aktiviteter'", () => {
    const { getByText } = render(
      <MemoryRouter>
        <NextButton
          rapporteringstype={Rapporteringstype.harIngenAktivitet}
          rapporteringsPeriode={rapporteringsPeriode}
        />
      </MemoryRouter>
    );

    const nextButton = getByText("Neste");
    expect(nextButton).toBeInTheDocument();

    expect(nextButton.closest("a")).toHaveAttribute(
      "href",
      `/periode/${rapporteringsPeriode.id}/send-inn`
    );
  });
});
