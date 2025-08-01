import { act, render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import Landingsside, { loader } from "~/routes/_index";

import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

describe("Hovedside rapportering", () => {
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
        Component: Landingsside,
        loader,
      },
      {
        path: "/api/start",
        action() {
          return new Response(null, {
            status: 303,
            headers: {
              Location: `/`,
            },
          });
        },
      },
    ]);
    render(<RoutesStub />);
  };

  const testDb = withDb(sessionRecord.getDatabase("123"));
  const mockResponse = () => server.use(...createHandlers(testDb));

  beforeEach(() => {
    testDb.clear();
  });

  describe("Landingsside", () => {
    test("Skal vise at bruker har ingen rapporteringsperiode", async () => {
      mockSession();
      mockResponse();

      await act(async () => {
        renderLandingsside();
      });

      expect(await screen.findByText(/rapportering-ingen-meldekort/)).toBeInTheDocument();
    });

    test("Skal vise at bruker har en fremtidig rapporteringsperiode", async () => {
      mockSession();
      const rapporteringsperiode = lagRapporteringsperiode({ kanSendes: false });
      testDb.addRapporteringsperioder(rapporteringsperiode);

      mockResponse();

      await act(async () => {
        renderLandingsside();
      });

      expect(
        await screen.findByText("rapportering-for-tidlig-a-sende-meldekort"),
      ).toBeInTheDocument();
    });
  });
});
