/**
 * By default, React Router will handle hydrating your app on the client for you.
 * You can reveal the default entry client file with the following: `npx react-router reveal`
 * For more information, see https://reactrouter.com/api/framework-conventions/entry.client.tsx
 */
import { FaroErrorBoundary } from "@grafana/faro-react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import routerConfig from "../react-router.config";

// React-router sin single-fetch forventer "{basename}.data" for rot-navigasjon (Link, tilbake-knapp, navigate(-1)),
// men den finnes ikke og returnerer 404. I stedet for å håndtere dette eksplisitt der det navigeres til i applikasjonen,
// omskriver vi URL-en her før den sendes.

function patchSingleFetchRootDataUrl() {
  const basename = routerConfig.basename;
  const brokenPathname = `${basename}.data`;
  const fixedPathname = `${basename}/_.data`;
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    const url =
      typeof input === "string" || input instanceof URL
        ? new URL(input, window.location.origin)
        : new URL(input.url);

    if (url.origin !== window.location.origin || url.pathname !== brokenPathname) {
      return originalFetch(input, init);
    }

    const fixedUrl = new URL(url);
    fixedUrl.pathname = fixedPathname;

    return originalFetch(new Request(fixedUrl, new Request(input, init)));

    return originalFetch(fixedUrl, init);
  };
}

patchSingleFetchRootDataUrl();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <FaroErrorBoundary>
        <HydratedRouter />
      </FaroErrorBoundary>
    </StrictMode>,
  );
});
