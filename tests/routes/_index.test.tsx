import { act, render, screen } from "@testing-library/react";
import { createRoutesStub, Outlet } from "react-router";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import Landingsside, { clientLoader, loader } from "~/routes/_index";

import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

describe("Hovedside rapportering", async () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  const renderLandingsside = () => {
    const RoutesStub = createRoutesStub([
      {
        path: "/",
        id: "root",
        Component: Outlet,
        loader: () => ({
          sanityTekst: {
            velkomstside: {
              velkomstTekst: [],
              harDuFaattDegJobb: { tittel: "", tekst: [] },
              innsendingsmulighet: {
                klarTilInnsending: { tittel: "", tekst: [] },
                ingenMeldekort: "Ingen meldekort",
                forTidlig: "Meldekortet kan ikke sendes inn ennå",
              },
            },
            knapper: { neste: "Neste", seOgEndreInnsendteMeldekort: "Se og endre" },
          },
        }),
        children: [
          {
            index: true,
            Component: Landingsside,
            loader,
          },
          {
            path: "api/start",
            action() {
              return new Response(null, {
                status: 303,
                headers: {
                  Location: `/`,
                },
              });
            },
          },
        ],
      },
    ]);
    render(<RoutesStub />);
  };

  const testDb = withDb(await sessionRecord.getDatabase("123"));
  const mockResponse = () => server.use(...createHandlers(testDb));

  beforeEach(() => {
    testDb.clear();
  });

  describe("Landingsside", () => {
    test("Skal laste startsiden som et fullt dokument ved klientnavigering", () => {
      const assign = vi.fn();
      const request = new Request("https://example.test/arbeid/dagpenger/meldekort/");
      vi.stubGlobal("window", { location: { assign } });

      try {
        void clientLoader({ request } as Parameters<typeof clientLoader>[0]);

        expect(assign).toHaveBeenCalledWith(request.url);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    test("Skal vise at bruker har ingen rapporteringsperiode", async () => {
      mockSession();
      mockResponse();

      await act(async () => {
        renderLandingsside();
      });

      expect(await screen.findByText("Ingen meldekort")).toBeInTheDocument();
    });

    test("Skal vise at bruker har en fremtidig rapporteringsperiode", async () => {
      mockSession();
      const rapporteringsperiode = lagRapporteringsperiode({ kanSendes: false });
      await testDb.addRapporteringsperioder(rapporteringsperiode);

      mockResponse();

      await act(async () => {
        renderLandingsside();
      });

      expect(await screen.findByText("Meldekortet kan ikke sendes inn ennå")).toBeInTheDocument();
    });
  });
});
