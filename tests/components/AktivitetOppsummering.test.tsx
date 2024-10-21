import { render, screen, within } from "@testing-library/react";
import { times } from "remeda";
import { beforeEach, describe, expect, test } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";

const bekreftAktivitet = async (label: RegExp, antall: RegExp) => {
  const element = screen.getByText(label);
  expect(element).toBeInTheDocument();
  expect(within(element).getByText(antall)).toBeInTheDocument();
};

describe("<AktivitetOppsummering/>", () => {
  describe("Uten aktiviteter", () => {
    const rapporteringsperiode: IRapporteringsperiode = lagRapporteringsperiode();

    test("Viser 0 timer og dager", () => {
      render(<AktivitetOppsummering periode={rapporteringsperiode} />);

      bekreftAktivitet(/rapportering-arbeid/, /0 rapportering-time/);
      bekreftAktivitet(/rapportering-syk/, /0 rapportering-dag/);
      bekreftAktivitet(/rapportering-fraevaer/, /0 rapportering-dag/);
      bekreftAktivitet(/rapportering-utdanning/, /0 rapportering-dag/);
    });
  });

  describe("Med aktiviteter", () => {
    const dager = [
      {
        dagIndex: 0,
        dato: "2024-01-01",
        aktiviteter: [{ type: "Arbeid", timer: "PT8H" }, { type: "Utdanning" }],
      },
      { dagIndex: 1, dato: "2024-01-02", aktiviteter: [{ type: "Syk" }] },
      { dagIndex: 2, dato: "2024-01-03", aktiviteter: [{ type: "Fravaer" }] },
      { dagIndex: 3, dato: "2024-01-03", aktiviteter: [{ type: "Arbeid", timer: "PT7H30M" }] },
      ...times(11, (i) => ({ dagIndex: i + 4, dato: "", aktiviteter: [] })),
    ];

    const rapporteringsperiode: IRapporteringsperiode = lagRapporteringsperiode({ dager });

    beforeEach(() => {
      render(<AktivitetOppsummering periode={rapporteringsperiode} />);
    });

    test("Viser riktig antall arbeidstimer", () => {
      bekreftAktivitet(/rapportering-arbeid/, /15,5 rapportering-time/);
    });

    test("Viser riktig antall dager", () => {
      bekreftAktivitet(/rapportering-syk/, /1 rapportering-dag/);
      bekreftAktivitet(/rapportering-fraevaer/, /1 rapportering-dag/);
      bekreftAktivitet(/rapportering-utdanning/, /1 rapportering-dag/);
    });
  });
});
