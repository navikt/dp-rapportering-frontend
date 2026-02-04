// @vitest-environment node
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { loader } from "~/routes/periode.$rapporteringsperiodeId";
import { IRapporteringsperiodeStatus } from "~/utils/types";

import { rapporteringsperioderResponse } from "../../mocks/responses/rapporteringsperioderResponse";
import { server } from "../../mocks/server";
import { endSessionMock, mockSession } from "../helpers/auth-helper";
import { catchErrorResponse } from "../helpers/response-helper";

describe("Parent route loader guard", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  const periodeId = rapporteringsperioderResponse[0].id;
  const testParams = { rapporteringsperiodeId: periodeId };

  describe("Guard: Redirect når periode ikke er TilUtfylling", () => {
    test("Skal redirecte fra /fyll-ut når status er Innsendt", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Innsendt,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = (await catchErrorResponse(() =>
        loader({
          request: new Request(
            `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/fyll-ut`,
          ),
          params: testParams,
          context: {},
          unstable_pattern: "",
        }),
      )) as Response;

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("../");
    });

    test("Skal redirecte fra /arbeidssoker når status er Ferdig", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Ferdig,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = (await catchErrorResponse(() =>
        loader({
          request: new Request(
            `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/arbeidssoker`,
          ),
          params: testParams,
          context: {},
          unstable_pattern: "",
        }),
      )) as Response;

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("../");
    });

    test("Skal redirecte fra /rapporteringstype når status er Feilet", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Feilet,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = (await catchErrorResponse(() =>
        loader({
          request: new Request(
            `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/rapporteringstype`,
          ),
          params: testParams,
          context: {},
          unstable_pattern: "",
        }),
      )) as Response;

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("../");
    });

    test("Skal redirecte fra /send-inn når status er Endret", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Endret,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = (await catchErrorResponse(() =>
        loader({
          request: new Request(
            `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/send-inn`,
          ),
          params: testParams,
          context: {},
          unstable_pattern: "",
        }),
      )) as Response;

      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe("../");
    });
  });

  describe("Guard: Unntakshåndtering - skal IKKE redirecte", () => {
    test("Skal IKKE redirecte fra /bekreftelse selv med Innsendt status", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Innsendt,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = await loader({
        request: new Request(
          `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/bekreftelse`,
        ),
        params: testParams,
        context: {},
        unstable_pattern: "",
      });

      expect(response).toHaveProperty("periode");
      expect(response.periode.status).toBe(IRapporteringsperiodeStatus.Innsendt);
    });

    test("Skal IKKE redirecte fra /endring/fyll-ut selv med Innsendt status", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Innsendt,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = await loader({
        request: new Request(
          `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/endring/fyll-ut`,
        ),
        params: testParams,
        context: {},
        unstable_pattern: "",
      });

      expect(response).toHaveProperty("periode");
      expect(response.periode.status).toBe(IRapporteringsperiodeStatus.Innsendt);
    });

    test("Skal IKKE redirecte fra /endre selv med Innsendt status", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Innsendt,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = await loader({
        request: new Request(
          `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/endre`,
        ),
        params: testParams,
        context: {},
        unstable_pattern: "",
      });

      expect(response).toHaveProperty("periode");
      expect(response.periode.status).toBe(IRapporteringsperiodeStatus.Innsendt);
    });

    test("Skal IKKE redirecte fra /endring/send-inn selv med Innsendt status", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.Innsendt,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = await loader({
        request: new Request(
          `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/endring/send-inn`,
        ),
        params: testParams,
        context: {},
        unstable_pattern: "",
      });

      expect(response).toHaveProperty("periode");
      expect(response.periode.status).toBe(IRapporteringsperiodeStatus.Innsendt);
    });

    test("Skal IKKE redirecte når status er TilUtfylling", async () => {
      mockSession();

      server.use(
        http.get(
          `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/${periodeId}`,
          () => {
            return HttpResponse.json(
              {
                ...rapporteringsperioderResponse[0],
                status: IRapporteringsperiodeStatus.TilUtfylling,
              },
              { status: 200 },
            );
          },
          { once: true },
        ),
      );

      const response = await loader({
        request: new Request(
          `http://localhost:3000/arbeid/dagpenger/meldekort/periode/${periodeId}/fyll-ut`,
        ),
        params: testParams,
        context: {},
        unstable_pattern: "",
      });

      expect(response).toHaveProperty("periode");
      expect(response.periode.status).toBe(IRapporteringsperiodeStatus.TilUtfylling);
    });
  });
});
