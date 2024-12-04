import type { SetupServerApi } from "msw/node";
import { setupServer } from "msw/node";

import { createHandlers } from "./handlers";

export const server = setupServer(...createHandlers());

export const setup = () => {
  return setupServer(...createHandlers()) as SetupServerApi;
};

export const start = (server: SetupServerApi) => {
  server.listen({ onUnhandledRequest: "bypass" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  console.info("🤫 Mock server");
};
