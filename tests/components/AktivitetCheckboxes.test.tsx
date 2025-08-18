import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AktivitetCheckboxes } from "~/components/aktivitet-checkbox/AktivitetCheckboxes";
import { AktivitetType } from "~/utils/aktivitettype.utils";

vi.mock("@rvf/react-router", () => {
  return {
    useField: () => ({ error: () => null, getInputProps: () => {} }),
  };
});

describe("AktivitetCheckboxes", () => {
  const defaultProps = {
    name: "aktiviteter",
    label: "Velg aktiviteter",
    verdi: [],
    aktiviteter: [],
    muligeAktiviteter: ["Arbeid", "Syk"] as AktivitetType[],
    onChange: vi.fn(),
    periodeId: "1",
  };

  it.skip("rendrer chekboxes med riktige label og beskrivelser", () => {
    render(<AktivitetCheckboxes {...defaultProps} />);

    defaultProps.muligeAktiviteter.forEach((aktivitet) => {
      const checkbox = screen.getByLabelText(aktivitet);
      expect(checkbox).toBeInTheDocument();
      expect(
        screen.getByText(`rapportering-aktivitet-radio-${aktivitet.toLowerCase()}-beskrivelse`),
      ).toBeInTheDocument();
    });
  });

  it("rendrer Fravær-chekbox med riktige label og beskrivelser", () => {
    const aktivitet = "Fravaer";
    const props = { ...defaultProps, muligeAktiviteter: [aktivitet] as AktivitetType[] };
    render(<AktivitetCheckboxes {...props} />);

    const checkbox = screen.getByText("rapportering-fraevaer");

    expect(checkbox).toBeInTheDocument();
    expect(
      screen.getByText(`rapportering-aktivitet-radio-${aktivitet.toLowerCase()}-beskrivelse`),
    ).toBeInTheDocument();
  });

  it("disabler chekboxes korrekt basert på valgte aktiviteter", () => {
    const selectedAktiviteter: AktivitetType[] = [AktivitetType.Arbeid];
    render(<AktivitetCheckboxes {...defaultProps} verdi={selectedAktiviteter} />);

    expect(screen.getByTestId("aktivitet-radio-Arbeid")).not.toBeDisabled();
    expect(screen.getByTestId("aktivitet-radio-Syk")).toBeDisabled();
  });

  it("kaller onChange med de riktige verdiene når checkbox klikkes", () => {
    const handleChange = vi.fn();
    render(<AktivitetCheckboxes {...defaultProps} onChange={handleChange} />);

    const arbeidCheckbox = screen.getByText("rapportering-arbeid");
    fireEvent.click(arbeidCheckbox);

    expect(handleChange).toHaveBeenCalledWith(["Arbeid"]);
  });

  it("viser feilmelding", () => {
    vi.mock("@rvf/react-router", () => {
      return {
        useField: () => ({ error: () => "Feilmelding", getInputProps: () => {} }),
      };
    });

    render(<AktivitetCheckboxes {...defaultProps} />);

    expect(screen.getByText("Feilmelding")).toBeInTheDocument();
  });
});
