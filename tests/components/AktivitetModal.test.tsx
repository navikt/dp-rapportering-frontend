import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import type { AktivitetType, IAktivitet } from "~/models/aktivitet.server";
import type {
  IPeriode,
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { AktivitetModal } from "~/components/aktivitet-modal/AktivitetModal";

vi.mock("remix-validated-form", () => ({
  ValidatedForm: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  useField: () => ({ error: null, getInputProps: () => {} }),
}));

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
  }),
}));

// Define mock data conforming to the interfaces
const mockPeriode: IPeriode = {
  fraOgMed: "2024-01-01",
  tilOgMed: "2024-01-31",
};

const mockAktivitet: IAktivitet = {
  id: "1",
  type: "Arbeid",
  timer: "PT5H",
};

const mockRapporteringsperiodeDag: IRapporteringsperiodeDag = {
  dagIndex: 1,
  dato: "2024-06-13",
  aktiviteter: [mockAktivitet],
};

const mockRapporteringsperiode: IRapporteringsperiode = {
  id: "1",
  periode: mockPeriode,
  dager: [mockRapporteringsperiodeDag],
  status: "TilUtfylling",
  kanSendesFra: "2024-06-01",
  kanSendes: true,
  kanKorrigeres: false,
};

const defaultProps = {
  rapporteringsperiode: mockRapporteringsperiode,
  valgtDato: mockRapporteringsperiodeDag.dato,
  valgteAktiviteter: [] as AktivitetType[],
  setValgteAktiviteter: vi.fn(),
  modalAapen: true,
  lukkModal: vi.fn(),
};

describe("AktivitetModal", () => {
  it("rendrer modal med riktig overskrift og formatert dato", () => {
    render(<AktivitetModal {...defaultProps} />);

    expect(screen.getByLabelText("rapportering-rapporter-aktivitet")).toBeInTheDocument();
    expect(screen.getByText("torsdag 13. juni")).toBeInTheDocument(); // Adjust based on actual date formatting
  });

  it("viser checkboxes og håndterer tilstandsendringer riktig", () => {
    render(<AktivitetModal {...defaultProps} />);

    const arbeidCheckbox = screen.getByLabelText("Arbeid");
    const utdanningCheckbox = screen.getByLabelText("Utdanning");
    const sykCheckbox = screen.getByLabelText("Syk");

    expect(arbeidCheckbox).toBeInTheDocument();
    expect(utdanningCheckbox).toBeInTheDocument();
    expect(sykCheckbox).toBeInTheDocument();

    fireEvent.click(arbeidCheckbox);
    expect(defaultProps.setValgteAktiviteter).toHaveBeenCalledWith(["Arbeid"]);
  });

  it.skip("viser TallInput-komponenten når 'Arbeid' er valgt", () => {
    render(<AktivitetModal {...defaultProps} valgteAktiviteter={["Arbeid"]} />);

    expect(screen.getByLabelText("rapportering-antall-timer:")).toBeInTheDocument();
  });

  it("viser feilmelding når actionData returnerer feilmelding", () => {
    // Mock actionData to return an error status
    vi.mock("@remix-run/react", () => ({
      useActionData: () => ({
        status: "error",
        error: { statusText: "Feilmelding" },
      }),
    }));

    render(<AktivitetModal {...defaultProps} />);

    expect(screen.getByText("Feilmelding")).toBeInTheDocument();
  });

  it.skip("sender form med riktige data", () => {
    render(<AktivitetModal {...defaultProps} valgteAktiviteter={["Arbeid"]} />);

    const submitButton = screen.getByRole("button", { name: "rapportering-lagre" });
    fireEvent.click(submitButton);

    const form = screen.getByRole("form");
    expect(form).toBeInTheDocument();
  });

  it("håndterer lukking av modalvindu", () => {
    render(<AktivitetModal {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: /lukk/i }));
    expect(defaultProps.lukkModal).toHaveBeenCalled();
  });
});
