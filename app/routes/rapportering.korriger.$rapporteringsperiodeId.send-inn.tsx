import { Alert, BodyLong, Button, Heading } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { logger } from "server/logger";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes-styles/rapportering.module.css";

export async function action({ request, params }: ActionArgs) {
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

export default function RapporteringSendInnRapporteringsperiodeid() {
  const actionData = useActionData<typeof action>();
  const { rapporteringsperiodeId } = useParams();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, []);

  return (
    <>
      <main className="rapportering-kontainer">
        <Heading
          ref={sidelastFokusRef}
          tabIndex={-1}
          level="2"
          size="medium"
          spacing
          className="vo-fokus"
        >
          Send inn korrigering
        </Heading>

        <BodyLong spacing>
          Jeg er kjent med at hvis opplysningene jeg har gitt ikke er riktige og fullstendige kan
          jeg miste retten til dagpenger.
        </BodyLong>
        <BodyLong spacing>
          Jeg er klar over at jeg må betale tilbake hvis jeg får for mye utbetalt.
        </BodyLong>

        {actionData?.error && (
          <Alert variant="error" className={styles.feilmelding}>
            {actionData.error}
          </Alert>
        )}

        <Form method="post">
          <div className="navigasjon-kontainer">
            <RemixLink
              to={`/rapportering/korriger/${rapporteringsperiodeId}/fyll-ut`}
              as="Button"
              variant="secondary"
            >
              Gå tilbake
            </RemixLink>

            <Button type="submit" variant="primary" iconPosition="right">
              Bekreft og send til NAV
            </Button>
          </div>
        </Form>
      </main>
    </>
  );
}
