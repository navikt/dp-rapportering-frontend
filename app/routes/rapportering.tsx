import { isRouteErrorResponse, Outlet, useRouteError } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getSession } from "~/utils/auth.utils.server";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import styles from "~/routes/rapportering.module.css";
import { Heading } from "@navikt/ds-react";

export async function loader({ request }: LoaderArgs) {
  console.log("rapportering loader");
  const session = await getSession(request);

  return json({ session });
}
export default function Rapportering() {
  return (
    <div id="dp-rapportering-frontend">
      <Outlet />
      <SessjonModal />
    </div>
  );
}
export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return (
        <div id="dp-rapportering-frontend">
          <div className={styles.rapporteringHeader}>
            <div className={styles.rapporteringHeaderInnhold}>
              <Heading level="1" size="xlarge">
                Dagpengerapportering
              </Heading>
            </div>
          </div>
          <main className={styles.rapporteringKontainer}>
            <SessjonModal sesjon={error.data.session} />
          </main>
        </div>
      );
    }
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }
}
