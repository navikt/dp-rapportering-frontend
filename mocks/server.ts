import { handlers } from "./handlers";
import type { SetupServerApi } from "msw/node";
import { setupServer } from "msw/node";

export const server = setupServer(...handlers);

export const setup = () => {
  return setupServer(...handlers) as SetupServerApi;
};

export const start = (server: SetupServerApi) => {
  server.listen({ onUnhandledRequest: "bypass" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  console.info("🤫 Mock server");
};
