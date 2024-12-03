import { screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import TomRapporteringsPeriodeSide from "~/routes/periode.$rapporteringsperiodeId.tom";

import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { withNestedRapporteringsperiode } from "../helpers/NestedStub";

const testDb = withDb(sessionRecord.getDatabase("123"));
const mockResponse = () => server.use(...createHandlers(testDb));

beforeEach(() => {
  testDb.clear();
});

describe("TomRapporteringsPeriodeSide", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  const rapporteringsperiode = {
    ...lagRapporteringsperiode({ kanSendes: true }),
    periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
  };

  const render = () => {
    withNestedRapporteringsperiode({
      path: "/periode/:rapporteringsperiodeId/tom",
      Component: TomRapporteringsPeriodeSide,
      initialEntry: `/periode/${rapporteringsperiode.id}/tom`,
    });
  };

  test("Skal vise alert om at brukeren ikke har meldt noe ", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);

    mockSession();
    mockResponse();

    render();

    expect(
      await screen.findByRole("heading", { name: /rapportering-tom-periode-tittel/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/rapportering-tom-periode-innhold/)).toBeInTheDocument();
  });

  test("Skal vise veiledning for neste steg", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);

    mockSession();
    mockResponse();

    render();

    expect(await screen.findByText(/rapportering-tom-ingen-å-rapportere/)).toBeInTheDocument();
  });

  test("Skal vise tilbake- og nesteknapp", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);

    mockSession();
    mockResponse();

    render();

    expect(
      await screen.findByRole("button", { name: /rapportering-knapp-tilbake/ }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: /rapportering-knapp-neste/ }),
    ).toBeInTheDocument();
  });
});
