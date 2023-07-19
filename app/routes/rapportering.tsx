import { type SessionWithOboProvider } from "@navikt/dp-auth/index/";
import { Alert, Heading } from "@navikt/ds-react";
import { json, type LoaderArgs } from "@remix-run/node";
import { Outlet, type ShouldRevalidateFunction, useLoaderData } from "@remix-run/react";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import {
  type IRapporteringsperiode,
  hentGjeldendePeriode,
  hentAllePerioder,
} from "~/models/rapporteringsperiode.server";
import { getSession } from "~/utils/auth.utils.server";

import styles from "./rapportering.module.css";

export interface IRapporteringLoader {
  rapporteringsperiode: IRapporteringsperiode;
  allePerioder: IRapporteringsperiode[];
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
  console.log("henter alle perioder");

  // Denne gjelder bare lokalt, DEV og PROD håndteres av wonderwall
  if (session.expiresIn === 0) {
    return json({ rapporteringsperiode: null, session, error: null });
  }

  let gjeldendePeriode = null;
  let allePerioder = null;
  let error = null;

  const gjeldendePeriodeResponse = await hentGjeldendePeriode(request);
  const allePerioderResponse = await hentAllePerioder(request);

  if (gjeldendePeriodeResponse.ok) {
    gjeldendePeriode = await gjeldendePeriodeResponse.json();
  }

  if (allePerioderResponse.ok) {
    allePerioder = await allePerioderResponse.json();
  } else {
    const { status, statusText } = allePerioderResponse;
    error = { status, statusText };
  }

  const rapporteringsperiode = gjeldendePeriode || allePerioder[0];

  return json({ rapporteringsperiode, session, error });
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
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        {error && <RapporteringError error={error} />}
        {!error && harSessjon && rapporteringsperiode && <Outlet />}

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
