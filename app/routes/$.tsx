import { useRouteError } from "react-router";

import { GeneralErrorBoundary } from "~/components/error-boundary/GeneralErrorBoundary";

export async function loader() {
  throw new Response("rapportering-feilmelding-ukjent-feil", { status: 404 });
}

export default function NotFoundRoute() {
  return null;
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary error={useRouteError()} />;
}
