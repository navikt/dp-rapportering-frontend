import type { SetupServerApi } from "msw/node";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

export const setup = () => setupServer(...handlers) as SetupServerApi;

export const start = (server: SetupServerApi) => {
  server.listen({ onUnhandledRequest: "error" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  console.info("🔶 Mock server");
};
