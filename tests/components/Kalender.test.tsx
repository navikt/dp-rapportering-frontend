import { render, screen } from "@testing-library/react";
import { format } from "date-fns";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { Kalender } from "~/components/kalender/Kalender";

const formaterDato = (dato: string) => `${format(new Date(dato), "d")}.`;

const renderKalender = (periode: IRapporteringsperiode, props = {}) => {
  return render(
    <MemoryRouter>
      <Kalender periode={periode} aapneModal={vi.fn()} locale={DecoratorLocale.NB} {...props} />
    </MemoryRouter>
  );
};

describe("<Kalender /> komponent", () => {
  test("Skal vise riktig tekst for periodeuker", () => {
    const periode = lagRapporteringsperiode({
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    });

    renderKalender(periode);

    expect(screen.getByText(/rapportering-uke 1 - 2/i)).toBeInTheDocument();
    expect(screen.getByText(/01.01.2024 - 14.01.2024/i)).toBeInTheDocument();
  });

  test("Skal vise endringslenke når den er aktivert", () => {
    const periode = lagRapporteringsperiode({
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    });

    renderKalender(periode, { visEndringslenke: true });

    expect(screen.getByText(/rapportering-redigeringslenke-endre/i)).toBeInTheDocument();
  });

  test("Skal vise riktig dagnavn som header", () => {
    const periode = lagRapporteringsperiode({
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    });

    renderKalender(periode);

    const dagnavn = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
    dagnavn.forEach((dag) => {
      expect(screen.getByText(dag)).toBeInTheDocument();
    });
  });

  test("Skal vise alle ukedager for perioden", () => {
    const periode = lagRapporteringsperiode({
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    });

    renderKalender(periode, { visEndringslenke: true });

    periode.dager.forEach((dag) => {
      expect(screen.getByText(formaterDato(dag.dato))).toBeInTheDocument();
    });
  });
});
