import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createRoutesStub } from "react-router";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

import { Layout, loader } from "~/root";
import { DP_RAPPORTERING_URL } from "~/utils/env.utils";

import { server } from "../mocks/server";
import { endSessionMock, mockSession } from "./helpers/auth-helper";
import { catchErrorResponse } from "./helpers/response-helper";

describe("Root", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  beforeEach(() => {
    vi.stubEnv("IS_LOCALHOST", "true");
    vi.stubEnv("USE_MSW", "true");
  });
  afterAll(() => server.close());
  afterEach(() => {
    server.resetHandlers();
    endSessionMock();
  });

  test("Viser andre-meldekort-meldingen hvis er DP-bruker og har Arena-meldekort", async () => {
    const Stub = createRoutesStub([
      {
        id: "root",
        path: "/",
        Component: () => <Layout>!</Layout>,
        loader: loader,
      },
    ]);

    render(<Stub />);

    await waitFor(() => screen.findByText("DECORATOR HEADER"));
    await waitFor(() => screen.findByText("DECORATOR FOOTER"));

    await waitFor(() => screen.findByText("andre-meldekort-tittel"));
  });

  test("Viser ikke andre-meldekort-meldingen hvis er DP-bruker og ikke har Arena-meldekort", async () => {
    server.use(
      http.get(`${DP_RAPPORTERING_URL}/harmeldeplikt`, () => {
        return HttpResponse.text("false");
      }),
    );

    const Stub = createRoutesStub([
      {
        id: "root",
        path: "/",
        Component: () => <Layout>!</Layout>,
        loader: loader,
      },
    ]);

    render(<Stub />);

    await waitFor(() => screen.findByText("DECORATOR HEADER"));
    await waitFor(() => screen.findByText("DECORATOR FOOTER"));

    const melding = screen.queryByText("andre-meldekort-tittel");
    expect(melding).toBeNull();
  });

  test("Sender bruker til meldekort-frontend hvis ikke er DP-bruker og har Arena-meldekort", async () => {
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
        unstable_pattern: "",
      }),
    )) as Response;

    expect(response.status).toBe(302);
  });
});
