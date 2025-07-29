/**
 * By default, React Router will handle hydrating your app on the client for you.
 * You can reveal the default entry client file with the following: `npx react-router reveal`
 * For more information, see https://reactrouter.com/api/framework-conventions/entry.client.tsx
 */
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
