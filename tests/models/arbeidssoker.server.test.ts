import { http, HttpResponse } from "msw";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { hentErRegistrertArbeidssoker, lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";

import { server } from "../../mocks/server";

const lagreUrl = `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:id/arbeidssoker`;
const hentUrl = `${process.env.DP_RAPPORTERING_URL}/er-registrert-arbeidssoker`;

vi.mock("~/utils/fetch.utils", () => ({
  getHeaders: vi.fn(() => ({
    "Content-Type": "application/json",
    Accept: "application",
    Authorization: "Bearer token",
  })),
  getCorrelationId: vi.fn(() => "123"),
}));

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());

describe("hentErRegistrertArbeidssoker", () => {
  const request = new Request(hentUrl);

  it("skal returnere true når bruker er registrert arbeidssøker", async () => {
    server.use(
      http.get(hentUrl, () => {
        return HttpResponse.json(true, { status: 200 });
      }),
    );

    const erRegistrertArbeidssoker = await hentErRegistrertArbeidssoker(request);

    expect(erRegistrertArbeidssoker).toBe(true);
  });

  it("skal returnere false når bruker ikke er registrert arbeidssøker", async () => {
    server.use(
      http.get(hentUrl, () => {
        return HttpResponse.json(false, { status: 200 });
      }),
    );

    const erRegistrertArbeidssoker = await hentErRegistrertArbeidssoker(request);

    expect(erRegistrertArbeidssoker).toBe(false);
  });

  it("skal kaste feil når API returnerer feil", async () => {
    server.use(
      http.get(hentUrl, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    await expect(hentErRegistrertArbeidssoker(request)).rejects.toThrow();
  });
});

describe("lagreArbeidssokerSvar", () => {
  const request = new Request(lagreUrl);
  const rapporteringsperiodeId = "123";

  it("kan lagre arbeidssøker-svar", async () => {
    server.use(
      http.post(lagreUrl, () => {
        return HttpResponse.json({}, { status: 200 });
      }),
    );

    const response = await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
      registrertArbeidssoker: true,
    });

    expect(response).toEqual({ status: "success" });
  });

  it("lagring av arbeidssøker-svar feiler", async () => {
    server.use(
      http.post(lagreUrl, () => {
        return new HttpResponse(null, { status: 500 });
      }),
    );

    const response = await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
      registrertArbeidssoker: true,
    });

    expect(response).toEqual({
      status: "error",
      error: {
        statusCode: 500,
        statusText: "rapportering-feilmelding-lagre-arbeidssoker-svar",
      },
      id: "123",
    });
  });
});
