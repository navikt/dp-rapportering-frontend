import { Alert, Button, Heading } from "@navikt/ds-react";
import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useRouteLoaderData } from "@remix-run/react";
import { logger } from "server/logger";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes-styles/rapportering.module.css";
import type { IRapporteringsPeriodeLoader } from "~/routes/rapportering.periode.$rapporteringsperiodeId";

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

  return redirect(`/rapportering/periode/${periodeId}/bekreftelse`);
}

export default function RapporteringSendInnRapporteringsperiodeid() {
  const { periode } = useRouteLoaderData(
    "routes/rapportering.periode.$rapporteringsperiodeId"
  ) as IRapporteringsPeriodeLoader;
  const actionData = useActionData<typeof action>();

  return (
    <>
      <main className="rapportering-kontainer">
        <Heading level="2" size="large" spacing>
          Send inn rapportering
        </Heading>

        <div className="registert-meldeperiode-kontainer">
          <Heading level="3" size="small">
            Dette er det du har registrert for meldeperioden:
          </Heading>
          <AktivitetOppsummering rapporteringsperiode={periode} />
        </div>

        {actionData?.error && (
          <Alert variant="error" className={styles.feilmelding}>
            {actionData.error}
          </Alert>
        )}

        <Form method="post">
          <div className="navigasjon-kontainer">
            <RemixLink to="/rapportering/alle" as="Button" variant="secondary">
              Lagre og fortsett senere
            </RemixLink>
            <Button type="submit" variant="primary" iconPosition="right">
              Send rapportering
            </Button>
          </div>
        </Form>
      </main>
    </>
  );
}
