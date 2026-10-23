import { act, render as renderComponent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createRoutesStub, Outlet } from "react-router";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";

import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { shouldRevalidate } from "~/routes/periode.$rapporteringsperiodeId";
import RapporteringstypeSide, {
  action as rapporteringstypeAction,
  loader as rapporteringstypeLoader,
} from "~/routes/periode.$rapporteringsperiodeId.rapporteringstype";
import { AktivitetType } from "~/utils/aktivitettype.utils";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { INetworkResponse, KortType, Rapporteringstype } from "~/utils/types";

import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { withNestedRapporteringsperiode } from "../helpers/NestedStub";

vi.mock("~/hooks/useLocale", () => ({
  useLocale: vi.fn(() => ({ locale: DecoratorLocale.NB })),
}));

const { trackSkjemaStegFullført } = vi.hoisted(() => ({
  trackSkjemaStegFullført: vi.fn(),
}));

vi.mock("~/hooks/useAnalytics", () => ({
  useAnalytics: () => ({
    trackSkjemaStegStartet: vi.fn(),
    trackSkjemaStegFullført,
  }),
}));

describe("RapporteringstypeSide", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
    trackSkjemaStegFullført.mockClear();
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

  describe("Sletting av aktiviteter før navigering", () => {
    const utsatt = () => {
      let resolve!: () => void;
      const promise = new Promise<void>((fullfor) => {
        resolve = fullfor;
      });
      return { promise, resolve };
    };

    const renderSletting = (
      type: IRapporteringsperiode["type"],
      resultat: () => INetworkResponse = () => ({ status: "success" }),
    ) => {
      let periode = lagRapporteringsperiode({
        type,
        rapporteringstype: Rapporteringstype.harIngenAktivitet,
      });
      periode.dager[0].aktiviteter = [{ type: AktivitetType.Arbeid, timer: "PT2H" }];

      const revalidering = utsatt();
      const navigering = utsatt();
      let slettet = false;
      const parentLoader = vi.fn(async () => {
        if (slettet) await revalidering.promise;
        return { periode };
      });
      const listeLoader = vi.fn(() => ({ rapporteringsperioder: [periode] }));
      const slettAction = vi.fn(() => {
        const response = resultat();
        if (response.status === "success") {
          slettet = true;
          periode = {
            ...periode,
            dager: periode.dager.map((dag) => ({ ...dag, aktiviteter: [] })),
          };
        }
        return response;
      });
      const nesteLoader = vi.fn(async () => {
        await navigering.promise;
        return null;
      });
      function NesteSide() {
        const { periode } = useTypedRouteLoaderData("routes/periode.$rapporteringsperiodeId");
        return <div>Aktiviteter: {periode.dager.flatMap((dag) => dag.aktiviteter).length}</div>;
      }
      const nestePath = type === KortType.ETTERREGISTRERT ? "send-inn" : "arbeidssoker";
      const RoutesStub = createRoutesStub([
        {
          id: "root",
          Component: Outlet,
          children: [
            {
              id: "routes/periode.$rapporteringsperiodeId",
              path: "/periode/:rapporteringsperiodeId",
              Component: Outlet,
              loader: parentLoader,
              shouldRevalidate,
              children: [
                {
                  path: "rapporteringstype",
                  Component: RapporteringstypeSide,
                  loader: listeLoader,
                },
                { path: nestePath, Component: NesteSide, loader: nesteLoader },
              ],
            },
            { path: "/api/slett-alle-aktiviteter", action: slettAction },
          ],
        },
      ]);
      renderComponent(<RoutesStub initialEntries={[`/periode/${periode.id}/rapporteringstype`]} />);
      return { revalidering, navigering, parentLoader, listeLoader, slettAction, nesteLoader };
    };

    test.each([KortType.ORDINAERT, KortType.ETTERREGISTRERT])(
      "Venter på oppdatert periode og navigerer bare én gang for %s",
      async (type) => {
        const { revalidering, navigering, parentLoader, listeLoader, slettAction, nesteLoader } =
          renderSletting(type);
        const nesteKnapp = await screen.findByRole("button", { name: "rapportering-knapp-neste" });
        await act(async () => nesteKnapp.click());

        await waitFor(() => expect(parentLoader).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(nesteKnapp).toBeDisabled());
        await act(async () => nesteKnapp.click());
        expect(slettAction).toHaveBeenCalledTimes(1);
        expect(nesteLoader).not.toHaveBeenCalled();
        expect(trackSkjemaStegFullført).not.toHaveBeenCalled();

        await act(async () => revalidering.resolve());
        await waitFor(() => expect(nesteLoader).toHaveBeenCalledTimes(1));
        expect(trackSkjemaStegFullført).toHaveBeenCalledTimes(1);
        const sporetPeriode: IRapporteringsperiode =
          trackSkjemaStegFullført.mock.calls[0][0].periode;
        expect(sporetPeriode.dager.flatMap((dag) => dag.aktiviteter)).toEqual([]);
        expect(listeLoader).toHaveBeenCalledTimes(2);

        await act(async () => navigering.resolve());
        expect(await screen.findByText("Aktiviteter: 0")).toBeInTheDocument();
        expect(nesteLoader).toHaveBeenCalledTimes(1);
        expect(trackSkjemaStegFullført).toHaveBeenCalledTimes(1);
        expect(parentLoader).toHaveBeenCalledTimes(3);
        expect(listeLoader).toHaveBeenCalledTimes(2);
      },
    );

    test("Viser feil og tillater nytt forsøk når sletting feiler", async () => {
      const resultat = vi
        .fn<() => INetworkResponse>()
        .mockReturnValueOnce({
          status: "error",
          error: { statusCode: 500, statusText: "rapportering-feilmelding-lagre-aktivitet" },
        })
        .mockReturnValue({ status: "success" });
      const { revalidering, navigering, slettAction, nesteLoader } = renderSletting(
        KortType.ORDINAERT,
        resultat,
      );
      const nesteKnapp = await screen.findByRole("button", { name: "rapportering-knapp-neste" });
      await act(async () => nesteKnapp.click());

      expect(
        await screen.findByText("rapportering-feilmelding-lagre-aktivitet"),
      ).toBeInTheDocument();
      await waitFor(() => expect(nesteKnapp).toBeEnabled());
      expect(nesteLoader).not.toHaveBeenCalled();
      expect(trackSkjemaStegFullført).not.toHaveBeenCalled();

      await act(async () => nesteKnapp.click());
      expect(slettAction).toHaveBeenCalledTimes(2);
      await act(async () => {
        revalidering.resolve();
        navigering.resolve();
      });
      expect(await screen.findByText("Aktiviteter: 0")).toBeInTheDocument();
      expect(trackSkjemaStegFullført).toHaveBeenCalledTimes(1);
    });
  });

  describe("Når brukeren har én periode", () => {
    test("Viser oversikt for nåværende periode", async () => {
      mockApiResponses([rapporteringsperiode]);
      await act(async () => {
        render();
      });

      expect(await screen.findByText(/rapportering-naavaerende-periode/)).toBeInTheDocument();
      expect(
        (await screen.findAllByText(/rapportering-uke 1 - 2 \(1. januar 2024 - 14. januar 2024\)/i))
          .length,
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
        (await screen.findAllByText(/rapportering-uke 1 - 2 \(1. januar 2024 - 14. januar 2024\)/i))
          .length,
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
