import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
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
    const RemixStub = createRemixStub([
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
    render(<RemixStub />);
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

      renderLandingsside();

      expect(await screen.findByText(/rapportering-ingen-meldekort/)).toBeInTheDocument();
    });

    test("Skal vise at bruker har en fremtidig rapporteringsperiode", async () => {
      mockSession();
      const rapporteringsperiode = lagRapporteringsperiode({ kanSendes: false });
      testDb.addRapporteringsperioder(rapporteringsperiode);

      mockResponse();

      renderLandingsside();

      expect(
        await screen.findByText("rapportering-for-tidlig-a-sende-meldekort"),
      ).toBeInTheDocument();
    });

    test("Skal vise samtykke hvis bruker har minst en rapporteringsperiode", async () => {
      mockSession();
      const rapporteringsperiode = lagRapporteringsperiode({ kanSendes: true });
      testDb.addRapporteringsperioder(rapporteringsperiode);

      mockResponse();

      renderLandingsside();

      expect(await screen.findByText(/rapportering-samtykke-tittel/)).toBeInTheDocument();
      expect(await screen.findByText(/rapportering-samtykke-beskrivelse/)).toBeInTheDocument();
      expect(
        await screen.findByRole("checkbox", { name: /rapportering-samtykke-checkbox/ }),
      ).toBeInTheDocument();

      expect(
        await screen.findByRole("button", { name: /rapportering-knapp-neste/ }),
      ).toBeDisabled();
    });

    test("kan trykke neste-knapp etter å ha krysset av for samtykke checkbox.", async () => {
      mockSession();
      const rapporteringsperiode = lagRapporteringsperiode({ kanSendes: true });
      testDb.addRapporteringsperioder(rapporteringsperiode);
      mockResponse();

      renderLandingsside();

      expect(await screen.findByText(/rapportering-samtykke-tittel/)).toBeInTheDocument();
      expect(await screen.findByText(/rapportering-samtykke-beskrivelse/)).toBeInTheDocument();

      const samtykkeCheckbox = await screen.findByRole("checkbox", {
        name: /rapportering-samtykke-checkbox/,
      });
      expect(samtykkeCheckbox).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: /rapportering-knapp-neste/ }),
      ).toBeDisabled();

      samtykkeCheckbox.click();
      expect(
        await screen.findByRole("button", { name: /rapportering-knapp-neste/ }),
      ).not.toBeDisabled();
    });
  });
});
