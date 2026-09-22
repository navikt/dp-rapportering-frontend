import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { times } from "remeda";
import { beforeEach, describe, expect, test } from "vitest";

import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

const meldekortdetaljer = {
  oppsummering: "Oppsummering",
  aktiviteter: {
    jobb: { lang: "Jobb", kort: "jobb" },
    syk: { lang: "Syk", kort: "syk" },
    ferie: { lang: "Ferie", kort: "ferie" },
    utdanning: { lang: "Utdanning", kort: "utdanning" },
  },
  tidsverdi: { timer: "timer", dager: "dager" },
};

const renderAktivitetOppsummering = async (periode: IRapporteringsperiode) => {
  render(
    <RouterProvider
      router={createMemoryRouter(
        [
          {
            id: "root",
            path: "/",
            Component: () => <AktivitetOppsummering periode={periode} />,
            loader: () => ({ sanityTekst: { meldekortdetaljer } }),
          },
        ],
        { initialEntries: ["/"] },
      )}
    />,
  );
  await waitFor(() => expect(screen.getByText("Jobb")).toBeInTheDocument());
};

const bekreftAktivitet = (label: RegExp, antall: RegExp) => {
  const element = screen.getByText(label);
  expect(element).toBeInTheDocument();
  expect(screen.getAllByText(antall).length).toBeGreaterThan(0);
};

describe("<AktivitetOppsummering/>", () => {
  describe("Uten aktiviteter", () => {
    const rapporteringsperiode: IRapporteringsperiode = lagRapporteringsperiode();

    test("Viser 0 timer og dager", async () => {
      await renderAktivitetOppsummering(rapporteringsperiode);

      await bekreftAktivitet(/Jobb/, /0 timer/);
      await bekreftAktivitet(/Syk/, /0 dager/);
      await bekreftAktivitet(/Ferie/, /0 dager/);
      await bekreftAktivitet(/Utdanning/, /0 dager/);
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

    beforeEach(async () => {
      await renderAktivitetOppsummering(rapporteringsperiode);
    });

    test("Viser riktig antall arbeidstimer", async () => {
      await bekreftAktivitet(/Jobb/, /15,5 timer/);
    });

    test("Viser riktig antall dager", async () => {
      await bekreftAktivitet(/Syk/, /1 dager/);
      await bekreftAktivitet(/Ferie/, /1 dager/);
      await bekreftAktivitet(/Utdanning/, /1 dager/);
    });
  });
});
