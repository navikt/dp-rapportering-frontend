import { ErrorResponse } from "react-router";
import { describe, expect, test, vi } from "vitest";

import {
  getErrorDescriptionTextId,
  getErrorTitleTextId,
  IError,
} from "~/components/error-boundary/GeneralErrorBoundary";

vi.mock(import("~/hooks/useSanity"), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

vi.mock(import("react-router"), () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isRouteErrorResponse: (error: any): error is ErrorResponse => "data" in (error as IError),
}));

describe("GeneralErrorBoundary", () => {
  describe("getErrorTitleTextId", () => {
    test("getErrorTitleTextId returnerer feilmelding fra response når error er en ErrorResponse", () => {
      const errorText = "rapportering-feilmelding";
      const title = getErrorTitleTextId({ data: errorText });

      expect(title).toBe(`${errorText}-tittel`);
    });

    test("getErrorTitleTextId returnerer defaultTitle når error ikke er håndtert", () => {
      const title = getErrorTitleTextId({});

      expect(title).toBe("rapportering-feilmelding-ukjent-feil-tittel");
    });
  });

  describe("getErrorDescriptionTextId", () => {
    test("getErrorDescriptionTextId returnerer feilmelding fra response når error er en ErrorResponse", () => {
      const errorText = "rapportering-feilmelding";
      const description = getErrorDescriptionTextId({ data: errorText });

      expect(description).toBe(`${errorText}-beskrivelse`);
    });

    test("getErrorDescriptionTextId returnerer feilmelding når error er en Error", () => {
      const errorText = "rapportering-feilmelding";
      const description = getErrorDescriptionTextId(new Error(errorText));

      expect(description).toBe(`${errorText}-beskrivelse`);
    });

    test("getErrorDescriptionTextId returnerer defaultDescription når error ikke er en håndtert", () => {
      const description = getErrorDescriptionTextId({});

      expect(description).toBe("rapportering-feilmelding-ukjent-feil-beskrivelse");
    });
  });
});
