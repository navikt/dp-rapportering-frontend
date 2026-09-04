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
  return <GeneralErrorBoundary error={error} />;
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

    // Uten sanityTexts (f.eks. når root sin egen loader har feilet) kan ikke spesifikk feiltekst
    // slås opp, så GeneralErrorBoundary viser alltid de generiske "ukjent feil"-tekstene.
    expect(
      await screen.findByText("rapportering-feilmelding-ukjent-feil-tittel"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/rapportering-feilmelding-ukjent-feil-beskrivelse/),
    ).toBeInTheDocument();
  });
});
