import { render, screen, within } from "@testing-library/react";
import { format } from "date-fns";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { Uke } from "~/components/kalender/Uke";

const formaterDato = (dato: string) => `${format(new Date(dato), "d")}.`;

const setupPeriode = (from: string, to: string) =>
  lagRapporteringsperiode({ periode: { fraOgMed: from, tilOgMed: to } });

const aapneModal = vi.fn();

const renderUke = (periode: IRapporteringsperiode, readonly: boolean) => {
  render(<Uke aapneModal={aapneModal} readonly={readonly} rapporteringUke={periode.dager} />);
};

describe("<Uke/>", () => {
  let periode: IRapporteringsperiode;
  let periodeMedAktiviteter: IRapporteringsperiode;

  beforeEach(() => {
    periode = setupPeriode("2024-01-01", "2024-01-14");

    periodeMedAktiviteter = {
      ...periode,
      dager: [
        {
          ...periode.dager[0],
          aktiviteter: [{ type: "Arbeid", timer: "PT7H30M" }, { type: "Utdanning" }],
        },
        {
          ...periode.dager[1],
          aktiviteter: [{ type: "Arbeid", timer: "PT7H30M" }],
        },
        ...periode.dager.slice(2),
      ],
    };
  });

  describe("Skal kunne ikke redigere (readonly)", () => {
    test("Skal liste alle dager", () => {
      renderUke(periode, true);

      periode.dager.forEach((dag) => {
        expect(screen.getByText(formaterDato(dag.dato))).toBeInTheDocument();
      });
    });

    test("Skal vise sum arbeidstimer", () => {
      renderUke(periodeMedAktiviteter, true);

      const dag1 = screen.getAllByRole("cell")[0];
      const dag2 = screen.getAllByRole("cell")[1];

      expect(within(dag1).getByText(/7,5/i)).toBeInTheDocument();
      expect(within(dag2).getByText(/7,5/i)).toBeInTheDocument();
    });
  });

  describe("Skal kunne redigere", () => {
    test("Skal liste alle dager som knapper", () => {
      renderUke(periode, false);

      periode.dager.forEach((dag) => {
        const dagElement = screen.getByText(formaterDato(dag.dato));
        expect(dagElement).toBeInTheDocument();
        expect(dagElement).toHaveRole("button");
        expect(dagElement).not.toBeDisabled();
      });
    });

    test("Skal kunne åpne modal ved klikk", () => {
      renderUke(periode, false);

      periode.dager.forEach((dag) => {
        screen.getByText(formaterDato(dag.dato)).click();
        expect(aapneModal).toHaveBeenCalledWith(dag.dato);
      });

      expect(aapneModal).toHaveBeenCalledTimes(periode.dager.length);
    });
  });
});
