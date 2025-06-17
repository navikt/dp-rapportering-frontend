import { act, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import RapporteringstypeSide, {
  action as rapporteringstypeAction,
  loader as rapporteringstypeLoader,
} from "~/routes/periode.$rapporteringsperiodeId.rapporteringstype";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { Rapporteringstype } from "~/utils/types";

import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { withNestedRapporteringsperiode } from "../helpers/NestedStub";

vi.mock("~/hooks/useLocale", () => ({
  useLocale: vi.fn(() => ({ locale: DecoratorLocale.NB })),
}));

describe("RapporteringstypeSide", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  let rapporteringsperiode = {
    ...lagRapporteringsperiode({ kanSendes: true }),
    periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
  };

  const render = () => {
    withNestedRapporteringsperiode({
      path: "/periode/:rapporteringsperiodeId/rapporteringstype",
      Component: RapporteringstypeSide,
      loader: rapporteringstypeLoader,
      action: rapporteringstypeAction,
      initialEntry: `/periode/${rapporteringsperiode.id}/rapporteringstype`,
    });
  };

  const mockApiResponses = (rapporteringsperioder: IRapporteringsperiode[]) => {
    mockSession();
    server.use(
      http.get(`${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`, () => {
        return HttpResponse.json(rapporteringsperioder, { status: 200 });
      }),
      http.get(
        `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:rapporteringsperiodeId`,
        () => HttpResponse.json(rapporteringsperioder[0], { status: 200 }),
      ),
    );
  };

  const mockApiRapporteringstype = () => {
    rapporteringsperiode = {
      ...rapporteringsperiode,
      rapporteringstype: Rapporteringstype.harIngenAktivitet,
    };
    mockApiResponses([rapporteringsperiode]);
  };

  describe("Når brukeren har én periode", () => {
    test("Viser oversikt for nåværende periode", async () => {
      mockApiResponses([rapporteringsperiode]);
      await act(async () => {
        render();
      });

      expect(await screen.findByText(/rapportering-naavaerende-periode/)).toBeInTheDocument();
      expect(
        (
          await screen.findAllByText(
            /rapportering-uke 1 - 2 \(01. januar 2024 - 14. januar 2024\)/i,
          )
        ).length,
      ).toBe(2);
    });
  });

  describe("Når brukeren har flere perioder", () => {
    const rapporteringsperiode1 = {
      ...lagRapporteringsperiode({ kanSendes: true }),
      periode: { fraOgMed: "2024-01-01", tilOgMed: "2024-01-14" },
    };

    const rapporteringsperiode2 = {
      ...lagRapporteringsperiode({ kanSendes: true }),
      periode: { fraOgMed: "2024-01-15", tilOgMed: "2024-01-28" },
    };

    const rapporteringsperioder = [rapporteringsperiode1, rapporteringsperiode2];

    test("Viser oversikt for første periode", async () => {
      mockApiResponses(rapporteringsperioder);
      await act(async () => {
        render();
      });

      expect(await screen.findByText(/rapportering-foerste-periode/)).toBeInTheDocument();
      expect(
        (
          await screen.findAllByText(
            /rapportering-uke 1 - 2 \(01. januar 2024 - 14. januar 2024\)/i,
          )
        ).length,
      ).toBe(2);
    });

    test("Viser info boks for flere perioder", async () => {
      mockApiResponses(rapporteringsperioder);
      await act(async () => {
        render();
      });

      expect(await screen.findByText(/rapportering-flere-perioder-tittel/)).toBeInTheDocument();
      expect(await screen.findByText(/rapportering-flere-perioder-innledning/)).toBeInTheDocument();
    });

    test("Viser alternativer for rapporteringstype", async () => {
      mockApiResponses([rapporteringsperiode]);
      await act(async () => {
        render();
      });

      expect(
        await screen.findByText(/rapportering-rapporter-navarende-tittel/),
      ).toBeInTheDocument();

      const [harAktiviteterRadio, harIngenAktiviteterRadio] = await Promise.all([
        screen.findByRole("radio", { name: /rapportering-noe-å-rapportere/i }),
        screen.findByRole("radio", { name: /rapportering-ingen-å-rapportere/i }),
      ]);

      expect(harAktiviteterRadio).toBeInTheDocument();
      expect(harIngenAktiviteterRadio).toBeInTheDocument();

      const tilUtfyllingKnapp = await screen.findByRole("button", {
        name: /rapportering-til-utfylling/i,
      });
      expect(tilUtfyllingKnapp).toBeInTheDocument();

      mockApiRapporteringstype();
      harIngenAktiviteterRadio.click();
    });
  });
});
