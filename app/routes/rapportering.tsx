import { Heading } from "@navikt/ds-react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { isRouteErrorResponse, Outlet, useRouteError } from "@remix-run/react";
import { DevelopmentContainer } from "~/components/development-container/DevelopmentContainer";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import { getSession } from "~/utils/auth.utils.server";
import { getEnv } from "~/utils/env.utils";

export async function loader({ request }: LoaderFunctionArgs) {
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

  if (isRouteErrorResponse(error)) {
    if (getEnv("IS_LOCALHOST") === "true" && error.status === 440) {
      return (
        <main>
          <div className="rapportering-header">
            <div className="rapportering-header-innhold">
              <Heading level="1" size="xlarge">
                Dagpengerapportering
              </Heading>
            </div>
          </div>
          <div className="rapportering-container">
            <DevelopmentContainer>
              <>
                Sessjon utløpt! &nbsp;
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://tokenx-token-generator.intern.dev.nav.no/api/obo?aud=dev-gcp:teamdagpenger:dp-rapportering"
                >
                  Klikk på lenken for å hente ny token
                </a>
              </>
            </DevelopmentContainer>
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
        <div className="rapportering-container">
          <Heading level="2" size="medium">
            {error.status} {error.statusText}
          </Heading>
          <p>{error.data}</p>
        </div>
      </main>
    );
  }
}
