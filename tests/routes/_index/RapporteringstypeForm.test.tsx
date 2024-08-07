import { useFetcher } from "@remix-run/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { RapporteringstypeForm } from "~/routes/_index/RapporteringstypeForm";
import { Rapporteringstype } from "~/utils/types";
import { useSanity } from "~/hooks/useSanity";

vi.mock("@remix-run/react", () => ({
  useFetcher: vi.fn(),
}));

vi.mock("~/hooks/useSanity", () => ({
  useSanity: vi.fn(),
}));

describe("RapporteringstypeForm", () => {
  const getAppText = (key: string) => key;
  const getRichText = (key: string) => key;

  beforeEach(() => {
    (useSanity as Mock).mockReturnValue({ getAppText, getRichText });
  });

  it("rendere radioknappene korrekt", () => {
    render(
      <RapporteringstypeForm
        label={getAppText("rapportering-rapporter-navarende-tittel")}
        description=""
        rapporteringstype={undefined}
        rapporteringsperiodeId="123"
      />
    );

    const radioAktivitet = screen.getByLabelText("rapportering-noe-å-rapportere");
    const radioIngenAktivitet = screen.getByTestId("rapportering-ingen-å-rapportere");

    expect(radioAktivitet).not.toBeChecked();
    expect(radioIngenAktivitet).not.toBeChecked();
  });

  it("oppdaterer radioknappene riktig", () => {
    render(
      <RapporteringstypeForm
        label={getAppText("rapportering-rapporter-navarende-tittel")}
        description=""
        rapporteringstype={Rapporteringstype.harAktivitet}
        rapporteringsperiodeId="123"
      />
    );

    const radioAktivitet = screen.getByLabelText("rapportering-noe-å-rapportere");
    const radioIngenAktivitet = screen.getByTestId("rapportering-ingen-å-rapportere");

    expect(radioAktivitet).toBeChecked();
    expect(radioIngenAktivitet).not.toBeChecked();
  });

  it("kalle start-endepunktet når en radioknapp velges første gang", () => {
    const mockSubmit = vi.fn();
    (useFetcher as Mock).mockReturnValue({ submit: mockSubmit });

    render(
      <RapporteringstypeForm
        label={getAppText("rapportering-rapporter-navarende-tittel")}
        description=""
        rapporteringstype={undefined}
        rapporteringsperiodeId="123"
      />
    );

    const radioAktivitet = screen.getByLabelText("rapportering-noe-å-rapportere");

    fireEvent.click(radioAktivitet);

    expect(mockSubmit).toHaveBeenCalledWith(
      { rapporteringsperiodeId: "123" },
      { method: "post", action: "api/start" }
    );

    expect(mockSubmit).toHaveBeenCalledWith(
      { rapporteringstype: Rapporteringstype.harAktivitet },
      { method: "post" }
    );
  });

  it("sender form med riktig rapporteringstype når en radioknapp er valgt", () => {
    const mockSubmit = vi.fn();
    (useFetcher as Mock).mockReturnValue({ submit: mockSubmit });

    render(
      <RapporteringstypeForm
        label={getAppText("rapportering-rapporter-navarende-tittel")}
        description=""
        rapporteringstype={Rapporteringstype.harIngenAktivitet}
        rapporteringsperiodeId="123"
      />
    );

    const radioAktivitet = screen.getByLabelText("rapportering-noe-å-rapportere");

    fireEvent.click(radioAktivitet);

    expect(mockSubmit).not.toHaveBeenCalledWith(
      { rapporteringsperiodeId: "123" },
      { method: "post", action: "api/start" }
    );

    expect(mockSubmit).toHaveBeenCalledWith(
      { rapporteringstype: Rapporteringstype.harAktivitet },
      { method: "post" }
    );
  });
});
