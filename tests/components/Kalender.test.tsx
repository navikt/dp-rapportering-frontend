import { render, screen } from "@testing-library/react";
import { formatDate } from "date-fns";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { Kalender } from "~/components/kalender/Kalender";

const formaterDato = (dato: string) => `${formatDate(new Date(dato), "d")}.`;

export const renderKalender = (periode: IRapporteringsperiode, props = {}) => {
  return render(
    <MemoryRouter>
      <Kalender periode={periode} aapneModal={vi.fn()} locale={DecoratorLocale.NB} {...props} />
    </MemoryRouter>
  );
};

export const testKalender = (periode: IRapporteringsperiode) => {
  expect(screen.getByText(/rapportering-uke 1 - 2/i)).toBeInTheDocument();
  expect(screen.getByText(/01.01.2024 - 14.01.2024/i)).toBeInTheDocument();

  const dagnavn = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  dagnavn.forEach((dag) => {
    expect(screen.getByText(dag)).toBeInTheDocument();
  });

  periode.dager.forEach((dag) => {
    expect(screen.getByText(formaterDato(dag.dato))).toBeInTheDocument();
  });
};

describe("<Kalender /> komponent", () => {
  test("Skal vise riktig tekst for periodeuker", () => {
    const periode = lagRapporteringsperiode({
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    });

    renderKalender(periode);
    testKalender(periode);
  });

  test("Skal vise endringslenke når den er aktivert", () => {
    const periode = lagRapporteringsperiode({
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    });

    renderKalender(periode, { visEndringslenke: true });
    testKalender(periode);
    expect(screen.getByText(/rapportering-redigeringslenke-endre/i)).toBeInTheDocument();
  });
});
