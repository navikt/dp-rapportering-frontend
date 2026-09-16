import { render, screen } from "@testing-library/react";
import { createRoutesStub, useRouteError } from "react-router";
import { describe, expect, test, vi } from "vitest";

import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";
import { useTypedRouteLoaderData } from "~/hooks/useTypedRouteLoaderData";

vi.mock(import("~/hooks/useSanity"), async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

vi.mock("@portabletext/react", () => ({
  PortableText: ({ value }: { value: unknown }) => <>{JSON.stringify(value)}</>,
}));

function KomponentSomManglerRuteData() {
  useTypedRouteLoaderData("routes/_index");
  return null;
}

function RuteFeilgrense() {
  const error = useRouteError();
  return (
    <>
      <span data-testid="route-error-name">{error instanceof Error ? error.name : "unknown"}</span>
      <GeneralErrorBoundary error={error} />
    </>
  );
}

describe("useTypedRouteLoaderData", () => {
  test("kaster MissingRouteLoaderDataError når ruten mangler loader-data, og GeneralErrorBoundary viser generisk fallback-tekst", async () => {
    const RoutesStub = createRoutesStub([
      {
        id: "routes/_index",
        path: "/",
        Component: KomponentSomManglerRuteData,
        ErrorBoundary: RuteFeilgrense,
      },
    ]);

    render(<RoutesStub initialEntries={["/"]} />);

    // Uten nye Sanity-tekster vises en diagnostisk markør i test/dev.
    expect(
      await screen.findByText("[Mangler Sanity: feilmeldinger.generellFeil.tittel]"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
