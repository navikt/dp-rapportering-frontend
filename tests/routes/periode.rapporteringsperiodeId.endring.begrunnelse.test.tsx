import { createRemixStub } from "@remix-run/testing";
import { render as TLRender, fireEvent, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import BegrunnelseSide, {
  action,
  loader,
} from "~/routes/periode.$rapporteringsperiodeId.endring.begrunnelse";
import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

const testDb = withDb(sessionRecord.getDatabase("123"));
const rapporteringsperiode: IRapporteringsperiode = {
  ...lagRapporteringsperiode({ kanSendes: true }),
};
const begrunnelseSide = `/periode/${rapporteringsperiode.id}/endring/begrunnelse`;

const mockResponse = () => server.use(...createHandlers(testDb));

const render = () => {
  const RemixStub = createRemixStub([
    {
      path: "/periode/:rapporteringsperiodeId/endring/begrunnelse",
      Component: BegrunnelseSide,
      loader,
      action,
      handle: {
        params: { rapporteringsperiodeId: rapporteringsperiode.id },
      },
    },
  ]);
  TLRender(<RemixStub initialEntries={[begrunnelseSide]} />);
};

beforeEach(() => {
  testDb.clear();
  mockSession();
  mockResponse();
  testDb.addRapporteringsperioder(rapporteringsperiode);
});

describe("BegrunnelseSide", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  test("Skal vise alle alternativer i begrunnelsesvalg", async () => {
    render();

    expect(
      await screen.findByRole("heading", { name: /rapportering-periode-endre-tittel/ })
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/rapportering-endring-begrunnelse-nedtrekksmeny-label/)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/rapportering-endring-begrunnelse-nedtrekksmeny-description/)
    ).toBeInTheDocument();

    const options = [
      "rapportering-endring-begrunnelse-nedtrekksmeny-select",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-1",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-2",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-3",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-4",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-5",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-6",
      "rapportering-endring-begrunnelse-nedtrekksmeny-option-other",
    ];

    options.forEach((option) =>
      expect(screen.getByText(new RegExp(option, "i"))).toBeInTheDocument()
    );
  });

  test("Skal kunne velge en begrunnelse", async () => {
    render();

    const select = await screen.findByLabelText(
      /rapportering-endring-begrunnelse-nedtrekksmeny-label/
    );

    const selectOption = async (value: string) => {
      fireEvent.change(select, { target: { value } });
      await waitFor(() => expect(select).toHaveValue(value));
    };

    await selectOption("rapportering-endring-begrunnelse-nedtrekksmeny-option-3");
    await selectOption("rapportering-endring-begrunnelse-nedtrekksmeny-option-4");
  });

  test("Må velge en begrunnelse for å gå videre", async () => {
    render();

    const nesteKnapp = await screen.findByRole("button", { name: /rapportering-knapp-neste/i });
    const select = await screen.findByLabelText(
      /rapportering-endring-begrunnelse-nedtrekksmeny-label/
    );

    expect(nesteKnapp).toHaveAttribute("disabled");

    fireEvent.change(select, {
      target: { value: "rapportering-endring-begrunnelse-nedtrekksmeny-option-3" },
    });

    await waitFor(() => expect(nesteKnapp).not.toHaveAttribute("disabled"));
  });
});