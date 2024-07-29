import { useFetcher } from "@remix-run/react";
import { fireEvent, render } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, test, vi } from "vitest";
import { RapporteringstypeForm } from "~/routes/_index/RapporteringstypeForm";
import { Rapporteringstype } from "~/hooks/useRapporteringstype";

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
  }),
}));

vi.mock("@remix-run/react", () => ({
  ...vi.importActual("@remix-run/react"),
  useFetcher: vi.fn(() => ({ submit: vi.fn() })),
}));

describe("<RapporteringstypeForm/>", () => {
  const setType = vi.fn();

  const rapporteringsperiodeId = "123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("rendere radioknappene korrekt", () => {
    const { getByText } = render(
      <RapporteringstypeForm
        type={undefined}
        setType={setType}
        rapporteringsperiodeId={rapporteringsperiodeId}
      />
    );

    expect(getByText("rapportering-noe-å-rapportere")).toBeInTheDocument();
    expect(getByText("rapportering-ingen-å-rapportere")).toBeInTheDocument();
  });

  test("kalle start-endepunktet når en radioknapp velges første gang", () => {
    const mockSubmit = vi.fn();
    (useFetcher as Mock).mockReturnValue({
      submit: mockSubmit,
    });

    const { getByLabelText } = render(
      <RapporteringstypeForm
        type={undefined}
        setType={setType}
        rapporteringsperiodeId={rapporteringsperiodeId}
      />
    );

    fireEvent.click(getByLabelText("rapportering-noe-å-rapportere"));

    expect(mockSubmit).toHaveBeenCalledWith(
      { _action: "start", rapporteringsperiodeId },
      { method: "post" }
    );
    expect(setType).toHaveBeenCalledWith(Rapporteringstype.harAktivitet);
  });

  test("ikke kalle start-endepunktet når typen er allerede satt", () => {
    const { getByLabelText } = render(
      <RapporteringstypeForm
        type={Rapporteringstype.harIngenAktivitet}
        setType={setType}
        rapporteringsperiodeId={rapporteringsperiodeId}
      />
    );

    fireEvent.click(getByLabelText("rapportering-noe-å-rapportere"));

    expect(useFetcher().submit).not.toHaveBeenCalled();
    expect(setType).toHaveBeenCalledWith(Rapporteringstype.harAktivitet);
  });
});
