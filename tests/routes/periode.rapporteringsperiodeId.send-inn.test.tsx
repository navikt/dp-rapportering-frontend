import { act, screen, within } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";
import RapporteringstypeSide, {
  action as sendInnAction,
  loader as sendInnLoader,
} from "~/routes/periode.$rapporteringsperiodeId.send-inn";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";

import { createHandlers } from "../../mocks/handlers";
import { withDb } from "../../mocks/responses/db";
import { server } from "../../mocks/server";
import { sessionRecord } from "../../mocks/session";
import { testKalender } from "../components/Kalender.test";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { withNestedRapporteringsperiode } from "../helpers/NestedStub";

vi.mock("~/hooks/useLocale", () => ({
  useLocale: vi.fn(() => ({ locale: DecoratorLocale.NB })),
}));

const testDb = withDb(sessionRecord.getDatabase("123"));
const rapporteringsperiode = lagRapporteringsperiode({
  periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
  registrertArbeidssoker: false,
});

const mockResponse = () => server.use(...createHandlers(testDb));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("RapporteringstypeSide", () => {
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  const render = () => {
    withNestedRapporteringsperiode({
      path: "/periode/:rapporteringsperiodeId/send-inn",
      Component: RapporteringstypeSide,
      loader: sendInnLoader,
      action: sendInnAction,
      initialEntry: `/periode/${rapporteringsperiode.id}/send-inn`,
    });
  };

  describe("Oppsummeringsside", () => {
    beforeEach(() => {
      testDb.clear();
      mockSession();
      mockResponse();
    });

    test("Uten aktiviteter", async () => {
      testDb.addRapporteringsperioder(rapporteringsperiode);

      await act(async () => {
        render();
      });

      expect(await screen.findByText(/rapportering-meldekort-ikke-sendt-enda/)).toBeInTheDocument();

      expect(screen.getAllByText(/rapportering-uke 1 - 2/i)).toHaveLength(2);
      expect(screen.getAllByText(/01. januar 2024 - 14. januar 2024/i)).toHaveLength(2);
      testKalender(rapporteringsperiode);

      // AktivitetOppsummering
      bekreftAktivitet("rapportering-arbeid", /0 rapportering-time/);
      bekreftAktivitet("rapportering-syk", /0 rapportering-dag/);
      bekreftAktivitet("rapportering-fraevaer", /0 rapportering-dag/);
      bekreftAktivitet("rapportering-utdanning", /0 rapportering-dag/);

      // Arbeidssøkerregister
      expect(
        screen.getByText(/rapportering-arbeidssokerregister-alert-tittel-avregistrert/),
      ).toBeInTheDocument();
    });

    test("Med aktiviteter", async () => {
      const dager: IRapporteringsperiodeDag[] = [
        {
          dagIndex: 0,
          dato: "2024-01-01",
          aktiviteter: [
            { type: AktivitetType.Arbeid, timer: "PT8H" },
            { type: AktivitetType.Utdanning },
          ],
        },
        { dagIndex: 1, dato: "2024-01-02", aktiviteter: [{ type: AktivitetType.Syk }] },
        { dagIndex: 2, dato: "2024-01-03", aktiviteter: [{ type: AktivitetType.Fravaer }] },
        {
          dagIndex: 3,
          dato: "2024-01-04",
          aktiviteter: [{ type: AktivitetType.Arbeid, timer: "PT7H30M" }],
        },
        ...rapporteringsperiode.dager.slice(4),
      ];

      testDb.addRapporteringsperioder({
        ...rapporteringsperiode,
        dager,
        registrertArbeidssoker: true,
      });

      await act(async () => {
        render();
      });

      expect(await screen.findByText(/rapportering-meldekort-ikke-sendt-enda/)).toBeInTheDocument();

      bekreftAktivitet("rapportering-arbeid", /15.5 rapportering-time/);
      bekreftAktivitet("rapportering-syk", /1 rapportering-dag/);
      bekreftAktivitet("rapportering-fraevaer", /1 rapportering-dag/);
      bekreftAktivitet("rapportering-utdanning", /1 rapportering-dag/);

      expect(
        screen.getByText(/rapportering-arbeidssokerregister-alert-tittel-registrert/),
      ).toBeInTheDocument();
    });
  });
});

const bekreftAktivitet = (label: string, antall: RegExp) => {
  const element = screen.getByText(label, { exact: true });
  expect(element).toBeInTheDocument();
  expect(within(element).getByText(antall)).toBeInTheDocument();
};
