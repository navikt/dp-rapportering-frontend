import { type SessionWithOboProvider } from "@navikt/dp-auth/index/";
import { Accordion, Alert, Heading } from "@navikt/ds-react";
import { json, type LoaderArgs } from "@remix-run/node";
import { Outlet, ShouldRevalidateFunction, useLoaderData } from "@remix-run/react";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import {
  IRapporteringsperiode,
  hentSisteRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { getSession } from "~/utils/auth.utils.server";
import { PeriodeHeaderDetaljer } from "~/components/PeriodeHeaderDetaljer";

import styles from "./rapportering.module.css";

export interface IRapporteringLoader {
  rapporteringsperiode: IRapporteringsperiode;
  session: SessionWithOboProvider;
  error: IError | null;
}

interface IError {
  status: number;
  statusText: string;
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  formAction,
  defaultShouldRevalidate,
}) => {
  if (formAction === "/rapportering/send-inn") {
    return false;
  }

  return defaultShouldRevalidate;
};

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);

  // Denne gjelder bare lokalt, DEV og PROD håndteres av wonderwall
  if (session.expiresIn === 0) {
    return json({ rapporteringsperiode: null, session, error: null });
  }

  const rapporteringsperiodeResponse = await hentSisteRapporteringsperiode(
    "gjeldende", // TODO: Dette bør vel helst være smartere 😅
    request
  );

  if (!rapporteringsperiodeResponse.ok) {
    const { status, statusText } = rapporteringsperiodeResponse;
    return json({ rapporteringsperiode: null, session, error: { status, statusText } });
  }

  const rapporteringsperiode = await rapporteringsperiodeResponse.json();

  return json({ rapporteringsperiode, session, error: null });
}

export default function Rapportering() {
  const { rapporteringsperiode, session, error } = useLoaderData<typeof loader>();
  const harSessjon = session?.expiresIn > 0;

  return (
    <div id="dp-rapportering-frontend">
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
          {rapporteringsperiode && (
            <PeriodeHeaderDetaljer rapporteringsperiode={rapporteringsperiode} />
          )}
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        {error && <RapporteringError error={error} />}
        {!error && harSessjon && rapporteringsperiode && <Outlet />}
        <Accordion className={styles.debug}>
          <Accordion.Item>
            <Accordion.Header>(DEBUG) Rapporteringsperiode som json:</Accordion.Header>
            <Accordion.Content>
              <pre>${JSON.stringify(rapporteringsperiode, null, 2)}</pre>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>
        <SessjonModal />
      </main>
    </div>
  );
}

interface IRapporteringError {
  error: IError;
}

function RapporteringError({ error }: IRapporteringError) {
  if (error.status === 404) {
    return (
      <main>
        <Alert variant="warning">Fant ikke rapporteringsperioder</Alert>
      </main>
    );
  }

  return (
    <main>
      <Alert variant="warning">Teknisk feil, prøv igjen senere</Alert>
    </main>
  );
}
