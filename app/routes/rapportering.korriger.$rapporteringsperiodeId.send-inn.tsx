import { Alert, BodyLong } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { logger } from "server/logger";
import invariant from "tiny-invariant";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import styles from "./rapportering.module.css";

export async function loader({ request, params }: ActionArgs) {
  invariant(params.rapporteringsperiodeId, "Fant ikke rapporteringsperiodeId");
  const periodeId = params.rapporteringsperiodeId;
  const godkjennPeriodeResponse = await godkjennPeriode(periodeId, request);

  if (!godkjennPeriodeResponse.ok) {
    logger.warn(`Klarte ikke godkjenne rapportering med id: ${periodeId}`, {
      statustext: godkjennPeriodeResponse.statusText,
    });

    return json({ error: "Det har skjedd noe feil med innsendingen din, prøv igjen." });
  }

  return redirect(`/rapportering/korriger/${periodeId}/bekreftelse`);
}

export default function KorrigeringSendInn() {
  const data = useLoaderData<typeof loader>();
  return (
    <>
      <main className={styles.rapporteringKontainer}>
        {data?.error && <Alert variant={"error"}>Aiaiai, noe gikk galt: {data.error}</Alert>}
        <BodyLong>Prøver å sende inn korrigeringen</BodyLong>
      </main>
    </>
  );
}
