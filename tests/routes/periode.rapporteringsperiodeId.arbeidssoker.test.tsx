import { act, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { loader as rapporteringsperiodeLoader } from "~/routes/periode.$rapporteringsperiodeId";
import ArbeidssøkerRegisterSide, {
  action as arbeidssokerregisterAction,
} from "~/routes/periode.$rapporteringsperiodeId.arbeidssoker";

import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { withNestedRapporteringsperiode } from "../helpers/NestedStub";

const testDb = withDb(sessionRecord.getDatabase("123"));
const rapporteringsperiode: IRapporteringsperiode = {
  ...lagRapporteringsperiode({ kanSendes: true }),
  registrertArbeidssoker: null,
};

const mockResponse = () => server.use(...createHandlers(testDb));

const render = () => {
  withNestedRapporteringsperiode({
    path: "/periode/:rapporteringsperiodeId/arbeidssoker",
    Component: ArbeidssøkerRegisterSide,
    action: arbeidssokerregisterAction,
    loader: rapporteringsperiodeLoader,
    initialEntry: `/periode/${rapporteringsperiode.id}/arbeidssoker`,
  });
};

beforeEach(() => {
  testDb.clear();
  mockSession();
  mockResponse();
});

describe("ArbeidssøkerRegisterSide", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  test("Skal vise spørsmål om arbeidssøker", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);
    await act(async () => {
      render();
    });

    expect(await screen.findByText(/rapportering-arbeidssokerregister-tittel/)).toBeInTheDocument();
    expect(
      await screen.findByText(/rapportering-arbeidssokerregister-subtittel/),
    ).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: /svar-ja/ })).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: /svar-nei/ })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /rapportering-knapp-neste/ })).toHaveAttribute(
      "disabled",
    );
  });

  test("Spørsmål om arbeidssøker skal være true og disabled når etterregistrering", async () => {
    const rapporteringsperiode09: IRapporteringsperiode = {
      ...rapporteringsperiode,
      type: "09",
      registrertArbeidssoker: true,
    };
    testDb.addRapporteringsperioder(rapporteringsperiode09);
    await act(async () => {
      render();
    });

    const radioJa = await screen.findByRole("radio", { name: /svar-ja/i });
    await waitFor(() => expect(radioJa).toBeChecked());
    expect(radioJa).toHaveAttribute("disabled");

    const radioNei = await screen.findByRole("radio", { name: /svar-nei/i });
    await waitFor(() => expect(radioNei).not.toBeChecked());
    expect(radioNei).toHaveAttribute("disabled");
  });

  test("Skal svare med 'Ja'", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);
    await act(async () => {
      render();
    });

    const radioJa = await screen.findByRole("radio", { name: /svar-ja/i });

    await act(async () => {
      radioJa.click();
    });

    await waitFor(() => expect(radioJa).toBeChecked());
    expect(
      await screen.findByRole("heading", { name: /alert-tittel-registrert/ }),
    ).toBeInTheDocument();
  });

  test("Skal svare med 'Nei'", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);
    await act(async () => {
      render();
    });

    const radioNei = await screen.findByRole("radio", { name: /svar-nei/i });

    await act(async () => {
      radioNei.click();
    });

    await waitFor(() => expect(radioNei).toBeChecked());
    expect(
      await screen.findByRole("heading", { name: /alert-tittel-avregistrert/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/alert-innhold-avregistrert/)).toBeInTheDocument();
  });

  test("Skal være allerede besvart med 'Ja'", async () => {
    testDb.addRapporteringsperioder({ ...rapporteringsperiode, registrertArbeidssoker: true });
    await act(async () => {
      render();
    });

    const radioJa = await screen.findByRole("radio", { name: /svar-ja/ });
    expect(radioJa).toBeChecked();

    expect(
      await screen.findByRole("heading", { name: /alert-tittel-registrert/ }),
    ).toBeInTheDocument();
  });

  test("Skal være allerede besvart med 'Nei'", async () => {
    testDb.addRapporteringsperioder({ ...rapporteringsperiode, registrertArbeidssoker: false });
    await act(async () => {
      render();
    });

    const radioNei = await screen.findByRole("radio", { name: /svar-nei/ });
    expect(radioNei).toBeChecked();

    expect(
      await screen.findByRole("heading", { name: /alert-tittel-avregistrert/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/alert-innhold-avregistrert/)).toBeInTheDocument();
  });
});
