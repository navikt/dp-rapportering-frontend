import { Alert, BodyLong, Button, Heading } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { logger } from "server/logger";
import invariant from "tiny-invariant";
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

  const navigate = useNavigate();
  const tilbake = () => navigate(-1);

  return (
    <>
      <main className="rapportering-kontainer">
        <Heading level="2" size="medium" spacing>
          Ønsker du å sende rapporteringen til NAV?
        </Heading>

        <BodyLong spacing>
          Jeg er kjent med at hvis opplysningene jeg har oppgitt ikke er riktige og fullstendige kan
          jeg miste retten til stønad fra NAV.
        </BodyLong>
        <BodyLong spacing>
          Jeg er også klar over at jeg må betale tilbake det jeg har fått feilaktig utbetalt.
        </BodyLong>
        <BodyLong spacing>
          (siste frist for å gjøre endringer selv om du har sendt inn til NAV denne perioden er
          søndag dd.mm)
        </BodyLong>

        {actionData?.error && (
          <Alert variant="error" className={styles.feilmelding}>
            {actionData.error}
          </Alert>
        )}

        <Form method="post">
          <div className="navigasjon-kontainer">
            <Button onClick={tilbake} variant="secondary">
              Avbryt og gå tilbake
            </Button>
            <Button type="submit" variant="primary" iconPosition="right">
              Bekreft og send til NAV
            </Button>
          </div>
        </Form>
      </main>
    </>
  );
}
