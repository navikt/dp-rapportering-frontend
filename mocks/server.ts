import { setupServer } from "msw/node";

import { createHandlers } from "./handlers";

export const server = setupServer(...createHandlers());

export const setup = () => setupServer(...createHandlers());

export const start = (server: ReturnType<typeof setup>) => {
  server.listen({ onUnhandledFrame: "bypass" });

  process.once("SIGINT", () => server.close());
  process.once("SIGTERM", () => server.close());

  console.info("🤫 Mock server");
};
