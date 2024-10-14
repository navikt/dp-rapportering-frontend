import { createRemixStub } from "@remix-run/testing";
import { render as TLRender, screen, waitFor } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import ArbeidssøkerRegisterSide, {
  action,
  loader,
} from "~/routes/periode.$rapporteringsperiodeId.arbeidssoker";
import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
    getLink: (key: string) => ({ linkText: key, href: key }),
    getRichText: (key: string) => key,
  }),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: string }) => value,
}));

const testDb = withDb(sessionRecord.getDatabase("123"));
const rapporteringsperiode: IRapporteringsperiode = {
  ...lagRapporteringsperiode({ kanSendes: true }),
  registrertArbeidssoker: null,
};
const tomRapporteringsPeriodeSide = `/periode/${rapporteringsperiode.id}/arbeidssoker`;

const mockResponse = () => server.use(...createHandlers(testDb));

const render = () => {
  const RemixStub = createRemixStub([
    {
      path: "/periode/:rapporteringsperiodeId/arbeidssoker",
      Component: ArbeidssøkerRegisterSide,
      loader,
      action,
      handle: {
        params: { rapporteringsperiodeId: rapporteringsperiode.id },
      },
    },
  ]);
  TLRender(<RemixStub initialEntries={[tomRapporteringsPeriodeSide]} />);
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
    render();

    expect(await screen.findByText(/rapportering-arbeidssokerregister-tittel/)).toBeInTheDocument();
    expect(
      await screen.findByText(/rapportering-arbeidssokerregister-subtittel/)
    ).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: /svar-ja/ })).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: /svar-nei/ })).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /rapportering-knapp-neste/ })).toHaveAttribute(
      "disabled"
    );
  });

  test("Skal svare med 'Ja'", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);
    render();

    const radioJa = await screen.findByRole("radio", { name: /svar-ja/i });

    radioJa.click();

    await waitFor(() => expect(radioJa).toBeChecked());
    expect(
      await screen.findByRole("heading", { name: /alert-tittel-registrert/ })
    ).toBeInTheDocument();
  });

  test("Skal svare med 'Nei'", async () => {
    testDb.addRapporteringsperioder(rapporteringsperiode);
    render();

    const radioNei = await screen.findByRole("radio", { name: /svar-nei/i });

    radioNei.click();

    await waitFor(() => expect(radioNei).toBeChecked());
    expect(
      await screen.findByRole("heading", { name: /alert-tittel-avregistrert/ })
    ).toBeInTheDocument();
    expect(await screen.findByText(/alert-innhold-avregistrert/)).toBeInTheDocument();
  });

  test("Skal være allerede besvart med 'Ja'", async () => {
    testDb.addRapporteringsperioder({ ...rapporteringsperiode, registrertArbeidssoker: true });
    render();

    const radioJa = await screen.findByRole("radio", { name: /svar-ja/ });
    expect(radioJa).toBeChecked();

    expect(
      await screen.findByRole("heading", { name: /alert-tittel-registrert/ })
    ).toBeInTheDocument();
  });

  test("Skal være allerede besvart med 'Nei'", async () => {
    testDb.addRapporteringsperioder({ ...rapporteringsperiode, registrertArbeidssoker: false });
    render();

    const radioNei = await screen.findByRole("radio", { name: /svar-nei/ });
    expect(radioNei).toBeChecked();

    expect(
      await screen.findByRole("heading", { name: /alert-tittel-avregistrert/ })
    ).toBeInTheDocument();
    expect(await screen.findByText(/alert-innhold-avregistrert/)).toBeInTheDocument();
  });
});
