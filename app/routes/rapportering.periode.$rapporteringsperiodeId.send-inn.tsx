import { Alert, BodyLong, Button, Heading } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { logger } from "server/logger";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { useScrollTilSeksjon } from "~/hooks/useScrollTilSeksjon";
import { useSetFokus } from "~/hooks/useSetFokus";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes-styles/rapportering.module.css";

export async function action({ request, params }: ActionArgs) {
  invariant(params.rapporteringsperiodeId, "Fant ikke rapporteringsperiodeId");
  const periodeId = params.rapporteringsperiodeId;
  const godkjennPeriodeResponse = await godkjennPeriode(periodeId, request);

  if (godkjennPeriodeResponse.ok) {
    return redirect(`/rapportering/periode/${periodeId}/bekreftelse`);
  } else {
    logger.warn(`Klarte ikke godkjenne rapportering med id: ${periodeId}`, {
      statustext: godkjennPeriodeResponse.statusText,
    });

    return json({ error: "Det har skjedd noe feil med innsendingen din, prøv igjen." });
  }
}

export default function RapporteringSendInnRapporteringsperiodeid() {
  const actionData = useActionData<typeof action>();
  const { rapporteringsperiodeId } = useParams();

  const sidelastFokusRef = useRef(null);
  const { setFocus } = useSetFokus();
  const { scrollIntoView } = useScrollTilSeksjon();

  useEffect(() => {
    scrollIntoView(sidelastFokusRef);
    setFocus(sidelastFokusRef);
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
          className="VO-fokus"
        >
          Ønsker du å sende rapporteringen til NAV?
        </Heading>

        <BodyLong spacing>
          Jeg er kjent med at hvis opplysningene jeg har oppgitt ikke er riktige og fullstendige kan
          jeg miste retten til stønad fra NAV.
        </BodyLong>
        <BodyLong spacing>
          Jeg er også klar over at jeg må betale tilbake det jeg har fått feilaktig utbetalt.
        </BodyLong>

        {actionData?.error && (
          <Alert variant="error" className={styles.feilmelding}>
            {actionData.error}
          </Alert>
        )}

        <Form method="post">
          <div className="navigasjon-kontainer">
            <RemixLink
              to={`/rapportering/periode/${rapporteringsperiodeId}/fyll-ut`}
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
