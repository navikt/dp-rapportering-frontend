import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { lagRapporteringsperiode } from "~/devTools/rapporteringsperiode";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import Landingsside, { loader } from "~/routes/_index";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";

vi.mock("~/hooks/useSanity", () => ({
  useSanity: () => ({
    getAppText: (key: string) => key,
    getLink: (key: string) => key,
    getRichText: (key: string) => key,
  }),
}));

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: string }) => value,
}));

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

  const mockResponse = (rapporteringsperioder: IRapporteringsperiode[]) => {
    server.use(
      http.get(
        `${process.env.DP_RAPPORTERING_URL}/rapporteringsperioder`,
        () => HttpResponse.json(rapporteringsperioder, { status: 200 }),
        { once: true }
      )
    );
  };

  describe("Landingsside", () => {
    test("Skal vise at bruker har ingen rapporteringsperiode", async () => {
      mockSession();
      mockResponse([]);

      renderLandingsside();

      expect(await screen.findByText(/rapportering-ingen-meldekort/)).toBeInTheDocument();
    });

    test("Skal vise at bruker har en fremtidig rapporteringsperiode", async () => {
      mockSession();
      const rapporteringsperioder = [lagRapporteringsperiode({ kanSendes: false })];
      mockResponse(rapporteringsperioder);

      renderLandingsside();

      expect(
        await screen.findByText("rapportering-for-tidlig-a-sende-meldekort")
      ).toBeInTheDocument();
    });

    test("Skal vise samtykke hvis bruker har minst en rapporteringsperiode", async () => {
      mockSession();
      const rapporteringsperioder = [lagRapporteringsperiode({ kanSendes: true })];
      mockResponse(rapporteringsperioder);

      renderLandingsside();

      expect(await screen.findByText(/rapportering-samtykke-tittel/)).toBeInTheDocument();
      expect(await screen.findByText(/rapportering-samtykke-beskrivelse/)).toBeInTheDocument();
      expect(
        await screen.findByRole("checkbox", { name: /rapportering-samtykke-checkbox/ })
      ).toBeInTheDocument();

      expect(await screen.findByRole("button", { name: /rapportering-neste/ })).toBeDisabled();
    });

    test("kan trykke neste-knapp etter å ha krysset av for samtykke checkbox.", async () => {
      mockSession();
      const rapporteringsperioder = [lagRapporteringsperiode({ kanSendes: true })];
      mockResponse(rapporteringsperioder);

      renderLandingsside();

      expect(await screen.findByText(/rapportering-samtykke-tittel/)).toBeInTheDocument();
      expect(await screen.findByText(/rapportering-samtykke-beskrivelse/)).toBeInTheDocument();

      const samtykkeCheckbox = await screen.findByRole("checkbox", {
        name: /rapportering-samtykke-checkbox/,
      });
      expect(samtykkeCheckbox).toBeInTheDocument();
      expect(await screen.findByRole("button", { name: /rapportering-neste/ })).toBeDisabled();

      samtykkeCheckbox.click();
      expect(await screen.findByRole("button", { name: /rapportering-neste/ })).not.toBeDisabled();
    });
  });
});
