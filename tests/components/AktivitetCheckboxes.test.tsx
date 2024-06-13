import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AktivitetType } from "~/models/aktivitet.server";
import { AktivitetCheckboxes } from "~/components/aktivitet-checkbox/AktivitetCheckboxes";

vi.mock("remix-validated-form", () => ({
  useField: () => ({ error: null }),
}));

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
  }),
}));

describe("AktivitetCheckboxes", () => {
  const defaultProps = {
    name: "aktiviteter",
    label: "Velg aktiviteter",
    verdi: [],
    muligeAktiviteter: ["Arbeid", "Utdanning", "Syk"] as AktivitetType[],
    onChange: vi.fn(),
  };

  it("rendrer chekboxes med riktige label og beskrivelser", () => {
    render(<AktivitetCheckboxes {...defaultProps} />);

    defaultProps.muligeAktiviteter.forEach((aktivitet) => {
      const checkbox = screen.getByLabelText(aktivitet);
      expect(checkbox).toBeInTheDocument();
      expect(
        screen.getByText(`rapportering-aktivitet-radio-${aktivitet.toLowerCase()}-beskrivelse`)
      ).toBeInTheDocument();
    });
  });

  it("rendrer Fravær-chekbox med riktige label og beskrivelser", () => {
    const aktivitet = "Fravaer";
    const props = { ...defaultProps, muligeAktiviteter: [aktivitet] as AktivitetType[] };
    render(<AktivitetCheckboxes {...props} />);

    const checkbox = screen.getByLabelText("Fravær");

    expect(checkbox).toBeInTheDocument();
    expect(
      screen.getByText(`rapportering-aktivitet-radio-${aktivitet.toLowerCase()}-beskrivelse`)
    ).toBeInTheDocument();
  });

  it("disabler chekboxes korrekt basert på valgte aktiviteter", () => {
    const selectedAktiviteter: AktivitetType[] = ["Arbeid"];
    render(<AktivitetCheckboxes {...defaultProps} verdi={selectedAktiviteter} />);

    expect(screen.getByLabelText("Arbeid")).not.toBeDisabled();
    expect(screen.getByLabelText("Utdanning")).not.toBeDisabled();
    expect(screen.getByLabelText("Syk")).toBeDisabled();
    // expect(screen.getByLabelText("Fravaer")).toBeDisabled();
  });

  it("kaller onChange med de riktige verdiene når checkbox klikkes", () => {
    const handleChange = vi.fn();
    render(<AktivitetCheckboxes {...defaultProps} onChange={handleChange} />);

    const arbeidCheckbox = screen.getByLabelText("Arbeid");
    fireEvent.click(arbeidCheckbox);

    expect(handleChange).toHaveBeenCalledWith(["Arbeid"]);
  });

  it("viser feilmelding", () => {
    vi.mock("remix-validated-form", () => ({
      useField: () => ({ error: "Feilmelding" }),
    }));

    render(<AktivitetCheckboxes {...defaultProps} />);

    expect(screen.getByText("Feilmelding")).toBeInTheDocument();
  });
});
