import type { SessionWithOboProvider } from "@navikt/dp-auth";
import { Heading } from "@navikt/ds-react";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, Outlet, useRouteError } from "@remix-run/react";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import { getSession } from "~/utils/auth.utils.server";

export interface ISessionLoader {
  session: SessionWithOboProvider;
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);

  return json({ session });
}

export default function Rapportering() {
  return (
    <main>
      <Outlet />
      <SessjonModal />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.log("treffer rapportering/ errorboundary", error);

  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return (
        <main>
          <div className="rapportering-header">
            <div className="rapportering-header-innhold">
              <Heading level="1" size="xlarge">
                Dagpengerapportering
              </Heading>
            </div>
          </div>
          <div className="rapportering-kontainer">
            <SessjonModal sesjon={error.data.session} />
          </div>
        </main>
      );
    }

    return (
      <main>
        <div className="rapportering-header">
          <div className="rapportering-header-innhold">
            <Heading level="1" size="xlarge">
              Dagpengerapportering
            </Heading>
          </div>
        </div>
        <div className="rapportering-kontainer">
          <Heading level="2" size="medium">
            {error.status} {error.statusText}
          </Heading>
          <p>{error.data}</p>
        </div>
      </main>
    );
  }
}
