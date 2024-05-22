import { Alert, BodyLong, Button, Heading } from "@navikt/ds-react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { useSetFokus } from "~/hooks/useSetFokus";
import { useScrollToView } from "~/hooks/useSkrollTilSeksjon";
import { logger } from "~/models/logger.server";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes-styles/rapportering.module.css";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";

export async function action({ request, params }: ActionFunctionArgs) {
  invariant(params.rapporteringsperiodeId, "params.rapporteringsperiode er påkrevd");

  const periodeId = params.rapporteringsperiodeId;
  const onBehalfOfToken = await getRapporteringOboToken(request);
  const godkjennPeriodeResponse = await godkjennPeriode(onBehalfOfToken, periodeId);

  if (!godkjennPeriodeResponse.ok) {
    logger.warn(`Klarte ikke godkjenne rapportering med id: ${periodeId}`, {
      statustext: godkjennPeriodeResponse.statusText,
    });
    return json({ error: "Det har skjedd noe feil med innsendingen din, prøv igjen." });
  }

  return redirect(`/rapportering/korriger/${periodeId}/bekreftelse`);
}

export default function KorrigeringSendInnSide() {
  const actionData = useActionData<typeof action>();
  const { rapporteringsperiodeId } = useParams();

  const sidelastFokusRef = useRef(null);
  const { setFokus } = useSetFokus();
  const { scrollToView } = useScrollToView();

  useEffect(() => {
    scrollToView(sidelastFokusRef);
    setFokus(sidelastFokusRef);
  }, [setFokus, scrollToView]);

  return (
    <>
      <div className="rapportering-container">
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
          <div className="navigasjon-container">
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
      </div>
    </>
  );
}
