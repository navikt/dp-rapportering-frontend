import { render, screen, within } from "@testing-library/react";
import { format } from "date-fns";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { Uke } from "~/components/kalender/Uke";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";

const formaterDato = (dato: string) => `${format(new Date(dato), "d")}.`;

const lagPeriode = (fraOgMed = "2024-01-01", tilOgMed = "2024-01-01") =>
  lagRapporteringsperiode({ periode: { fraOgMed, tilOgMed } });

const aapneModal = vi.fn();

const locale = DecoratorLocale.NB;

const renderUke = (rapporteringUke: IRapporteringsperiodeDag[], props?: { readonly: boolean }) => {
  const { readonly } = props || {};
  render(
    <Uke
      aapneModal={aapneModal}
      readonly={readonly}
      rapporteringUke={rapporteringUke}
      locale={locale}
    />,
  );
};

describe("<Uke/>", () => {
  let rapporteringUke: IRapporteringsperiodeDag[];
  let rapporteringUkeMedAktiviteter: IRapporteringsperiodeDag[];

  beforeEach(() => {
    const periode = lagPeriode("2024-01-01", "2024-01-14");
    rapporteringUke = periode.dager.slice(0, 7);

    rapporteringUkeMedAktiviteter = [
      {
        ...periode.dager[0],
        aktiviteter: [
          { type: AktivitetType.Arbeid, timer: "PT7H30M" },
          { type: AktivitetType.Utdanning },
        ],
      },
      {
        ...periode.dager[1],
        aktiviteter: [{ type: AktivitetType.Arbeid, timer: "PT7H30M" }],
      },
      ...periode.dager.slice(2),
    ];
  });

  describe("Skal kunne ikke redigere (readonly)", () => {
    test("Skal liste alle dager", () => {
      renderUke(rapporteringUke, { readonly: true });

      rapporteringUke.forEach((dag) => {
        expect(screen.getByText(formaterDato(dag.dato))).toBeInTheDocument();
      });
    });

    test("Skal vise sum arbeidstimer", () => {
      renderUke(rapporteringUkeMedAktiviteter, { readonly: true });

      const dag1 = screen.getAllByRole("cell")[0];
      const dag2 = screen.getAllByRole("cell")[1];

      expect(within(dag1).getByText(/7,5/i)).toBeInTheDocument();
      expect(within(dag2).getByText(/7,5/i)).toBeInTheDocument();
    });
  });

  describe("Skal kunne redigere", () => {
    test("Skal liste alle dager som knapper", () => {
      renderUke(rapporteringUke);

      rapporteringUke.forEach((dag) => {
        const dagElement = screen.getByText(formaterDato(dag.dato));
        expect(dagElement).toBeInTheDocument();
        expect(dagElement).toHaveRole("button");
        expect(dagElement).not.toBeDisabled();
      });
    });

    test("Skal kunne åpne modal ved klikk", () => {
      renderUke(rapporteringUke);

      rapporteringUke.forEach((dag) => {
        screen.getByText(formaterDato(dag.dato)).click();
        expect(aapneModal).toHaveBeenCalledWith(dag.dato);
      });

      expect(aapneModal).toHaveBeenCalledTimes(rapporteringUke.length);
    });
  });
});
