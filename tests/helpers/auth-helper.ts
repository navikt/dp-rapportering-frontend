import { type MockInstance, vi } from "vitest";

import * as mockAuth from "~/utils/auth.utils.server";

const mockToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJwaWQiOiIxMjMxMjMxMjMifQ.XdPmoIvLFmgz51eH_05WBNOllgWEtp9kYHkWAHqMwEc";

let getRapporteringOboTokenSpy: MockInstance;

export function mockSession() {
  getRapporteringOboTokenSpy = vi.spyOn(mockAuth, "getRapporteringOboToken");

  return {
    getRapporteringOboToken: getRapporteringOboTokenSpy.mockReturnValue(Promise.resolve(mockToken)),
  };
}

export function endSessionMock() {
  getRapporteringOboTokenSpy?.mockRestore();
}
