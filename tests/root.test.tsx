import { DecoratorElements } from "@navikt/nav-dekoratoren-moduler/ssr";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { loader } from "~/root";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";

import { server } from "../mocks/server";
import { endSessionMock, mockSession } from "./helpers/auth-helper";
import { catchErrorResponse } from "./helpers/response-helper";

describe("Root", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  test("Skal sende bruker til meldekort-frontend hvis ikke har DP", async () => {
    server.use(
      http.get(
        `${DP_RAPPORTERING_URL}/hardpmeldeplikt`,
        () => {
          return HttpResponse.text("false");
        },
        { once: true },
      ),
    );

    mockSession();

    const response = (await catchErrorResponse(() =>
      loader({
        request: new Request("http://localhost:3000"),
        params: {},
        context: {},
      }),
    )) as Response;

    expect(response.status).toBe(302);
  });

  test("Skal ikke sende bruker til meldekort-frontend hvis har DP", async () => {
    server.use(
      http.get(
        `${DP_RAPPORTERING_URL}/hardpmeldeplikt`,
        () => {
          return HttpResponse.text("true");
        },
        { once: true },
      ),
    );

    mockSession();

    const response = (await loader({
      request: new Request("http://localhost:3000"),
      params: {},
      context: {},
    })) as { fragments: DecoratorElements };

    expect(response.fragments).not.toBeNull();
  });
});
