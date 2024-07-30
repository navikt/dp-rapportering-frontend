import { useFetcher } from "@remix-run/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSanity } from "~/hooks/useSanity";
import { ArbeidssokerRegisterering } from "~/components/arbeidssokerregister/ArbeidssokerRegister";

interface MockFetcher {
  submit: Mock;
  Form: ({ children }: { children: React.ReactNode }) => JSX.Element;
  data?: { status: string };
}

// Mock the useFetcher and useSanity hooks at the top level
vi.mock("@remix-run/react", () => ({
  useFetcher: vi.fn(),
}));

vi.mock("~/hooks/useSanity", () => ({
  useSanity: vi.fn(),
}));

describe("ArbeidssokerRegister", () => {
  const mockFetcher: MockFetcher = {
    submit: vi.fn(),
    Form: ({ children }: { children: React.ReactNode }) => <form>{children}</form>,
  };

  const mockGetAppText = vi.fn((key) => key);
  const mockGetRichText = vi.fn((key) => [{ children: [{ text: key }] }]);

  beforeEach(() => {
    (useFetcher as Mock).mockReturnValue(mockFetcher);
    (useSanity as unknown as Mock).mockReturnValue({
      getAppText: mockGetAppText,
      getRichText: mockGetRichText,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("rendrer komponenten med initiell tilstand", () => {
    render(
      <ArbeidssokerRegisterering rapporteringsperiodeId="testId" registrertArbeidssoker={null} />
    );

    expect(screen.getByText("rapportering-arbeidssokerregister-tittel")).toBeInTheDocument();
    expect(screen.getByText("rapportering-arbeidssokerregister-subtittel")).toBeInTheDocument();
    expect(screen.getByText("rapportering-arbeidssokerregister-svar-ja")).toBeInTheDocument();
    expect(screen.getByText("rapportering-arbeidssokerregister-svar-nei")).toBeInTheDocument();
  });

  it("håndterer optimistisk UI-oppdatering ved endring av radioknapp", async () => {
    render(
      <ArbeidssokerRegisterering rapporteringsperiodeId="testId" registrertArbeidssoker={null} />
    );

    const yesRadio = screen.getByLabelText("rapportering-arbeidssokerregister-svar-ja");
    const noRadio = screen.getByLabelText("rapportering-arbeidssokerregister-svar-nei");

    fireEvent.click(yesRadio);
    expect(mockFetcher.submit).toHaveBeenCalledWith(
      {
        registrertArbeidssoker: true,
        rapporteringsperiodeId: "testId",
      },
      { method: "post", action: "api/arbeidssoker" }
    );

    fireEvent.click(noRadio);
    expect(mockFetcher.submit).toHaveBeenCalledWith(
      {
        registrertArbeidssoker: false,
        rapporteringsperiodeId: "testId",
      },
      { method: "post", action: "api/arbeidssoker" }
    );
  });

  it("viser RegistrertArbeidssoker-Alert", () => {
    render(
      <ArbeidssokerRegisterering rapporteringsperiodeId="testId" registrertArbeidssoker={true} />
    );

    expect(
      screen.getByText("rapportering-arbeidssokerregister-alert-tittel-registrert")
    ).toBeInTheDocument();
  });

  it("viser AvregistrertArbeidssoker-Alert", () => {
    render(
      <ArbeidssokerRegisterering rapporteringsperiodeId="testId" registrertArbeidssoker={false} />
    );

    expect(
      screen.getByText("rapportering-arbeidssokerregister-alert-tittel-avregistrert")
    ).toBeInTheDocument();
  });
});
