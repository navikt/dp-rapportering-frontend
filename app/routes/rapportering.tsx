import type { SessionWithOboProvider } from "@navikt/dp-auth";
import { Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, Outlet, useRouteError } from "@remix-run/react";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import styles from "~/routes-styles/rapportering.module.css";
import { getSession } from "~/utils/auth.utils.server";

export interface ISessionLoader {
  session: SessionWithOboProvider;
}

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
  console.log("treffer rapportering/ errorboundary", error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return (
        <div id="dp-rapportering-frontend">
          <div className="rapportering-header">
            <div className="rapportering-header-innhold">
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
      <div id="dp-rapportering-frontend">
        <div className="rapportering-header">
          <div className="rapportering-header-innhold">
            <Heading level="1" size="xlarge">
              Dagpengerapportering
            </Heading>
          </div>
        </div>
        <main className={styles.rapporteringKontainer}>
          <h2>
            {error.status} {error.statusText}
          </h2>
          <p>{error.data}</p>
        </main>
      </div>
    );
  }
}
