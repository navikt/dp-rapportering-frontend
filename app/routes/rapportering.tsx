import { type SessionWithOboProvider } from "@navikt/dp-auth/index/";
import { Accordion, Alert, Heading } from "@navikt/ds-react";
import { json, type LoaderArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { SessjonModal } from "~/components/session-modal/SessjonModal";
import {
  IRapporteringsperiode,
  hentSisteRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { getSession } from "~/utils/auth.utils.server";
import { formaterPeriodeDato, formaterPeriodeTilUkenummer } from "~/utils/dato.utils";

import styles from "./rapportering.module.css";

export interface IRapporteringLoader {
  rapporteringsperiode: IRapporteringsperiode;
  session: SessionWithOboProvider;
}

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request);

  // Utløpt sessjon
  if (session.expiresIn === 0) {
    return json({ rapporteringsperiode: null, session });
  }

  const rapporteringsperiodeResponse = await hentSisteRapporteringsperiode(
    "gjeldende", // TODO: Dette bør vel helst være smartere 😅
    request
  );

  // Her må vi gjøre noe smartere
  // Per nå får vi et object med atributter med null i verdi
  const rapporteringsperiode = rapporteringsperiodeResponse.id
    ? rapporteringsperiodeResponse
    : null;

  return json({ rapporteringsperiode, session });
}

export default function Rapportering() {
  const { rapporteringsperiode, session } = useLoaderData<typeof loader>();
  const sessjonUtlopt = session?.expiresIn === 0;

  function hentPeriodeTekst() {
    if (!rapporteringsperiode) {
      return <></>;
    }

    const { fraOgMed, tilOgMed } = rapporteringsperiode;

    return (
      <p>
        Uke
        {formaterPeriodeTilUkenummer(fraOgMed, tilOgMed)}({formaterPeriodeDato(fraOgMed, tilOgMed)})
      </p>
    );
  }

  return (
    <div id="dp-rapportering-frontend">
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading level="1" size="xlarge">
            Dagpengerapportering
          </Heading>
          {rapporteringsperiode && hentPeriodeTekst()}
        </div>
      </div>
      <main className={styles.rapporteringKontainer}>
        {!sessjonUtlopt && rapporteringsperiode && <Outlet />}
        {sessjonUtlopt && !rapporteringsperiode && (
          <main>
            <Alert variant="warning">Fant ikke rapporteringsperioder</Alert>
          </main>
        )}

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
