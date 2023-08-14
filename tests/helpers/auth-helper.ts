import { type SpyInstance, vi } from "vitest";
import { type SessionWithOboProvider } from "@navikt/dp-auth";

import * as mockAuth from "~/utils/auth.utils.server";

const mockToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwaWQiOiIxMjMxMjMxMjMifQ.XdPmoIvLFmgz51eH_05WBNOllgWEtp9kYHkWAHqMwEc";

let getSessionSpy: SpyInstance, getRapporteringOboTokenSpy: SpyInstance;

export function mockSession() {
  getSessionSpy = vi.spyOn(mockAuth, "getSession");
  getRapporteringOboTokenSpy = vi.spyOn(mockAuth, "getRapporteringOboToken");

  const obj: SessionWithOboProvider = {
    token: mockToken,
    apiToken: async () => "access_token",
    expiresIn: 123,
  };

  return {
    getSession: getSessionSpy.mockReturnValue(Promise.resolve(obj)),
    getRapporteringOboToken: getRapporteringOboTokenSpy.mockReturnValue(Promise.resolve(mockToken)),
  };
}

export function endSessionMock() {
  getSessionSpy && getSessionSpy.mockRestore();
  getRapporteringOboTokenSpy && getRapporteringOboTokenSpy.mockRestore();
}
