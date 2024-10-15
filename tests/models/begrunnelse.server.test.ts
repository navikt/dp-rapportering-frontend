import { HttpResponse, http } from "msw";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { lagreBegrunnelse } from "~/models/begrunnelse.server";
import { server } from "../../mocks/server";

const url = `${process.env.DP_RAPPORTERING_URL}/rapporteringsperiode/:id/begrunnelse`;

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

describe("lagreBegrunnelse", () => {
  const request = new Request(url);
  const rapporteringsperiodeId = "123";
  const begrunnelseEndring = "Sykdom";

  it("kan lagre begrunnelse", async () => {
    server.use(
      http.post(url, () => {
        return HttpResponse.json({}, { status: 200 });
      })
    );

    const response = await lagreBegrunnelse(request, rapporteringsperiodeId, begrunnelseEndring);

    expect(response).toEqual({ status: "success" });
  });

  it("lagring av begrunnelse feiler", async () => {
    server.use(
      http.post(url, () => {
        return HttpResponse.json({}, { status: 500 });
      })
    );

    const response = await lagreBegrunnelse(request, rapporteringsperiodeId, begrunnelseEndring);

    expect(response).toEqual({
      status: "error",
      error: {
        statusCode: 500,
        statusText: "rapportering-feilmelding-lagre-begrunnelse",
      },
      id: "123",
    });
  });
});
