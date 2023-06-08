import { Left, Right } from "@navikt/ds-icons";
import { Alert, BodyShort, Button, Heading, ReadMore } from "@navikt/ds-react";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useRouteLoaderData } from "@remix-run/react";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { IRapporteringLoader } from "./rapportering";
import invariant from "tiny-invariant";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import { logger } from "server/logger";

import styles from "./rapportering.module.css";

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const rapporteringsperiodeId = formdata.get("rapporteringsperiodeId") as string;

  invariant(rapporteringsperiodeId, "Fant ikke rapporteringsperiodeId");

  const godkjennPeriodeResponse = await godkjennPeriode(rapporteringsperiodeId, request);

  if (!godkjennPeriodeResponse.ok) {
    logger.warn(`Klarte ikke godkjenne rapportering med id: ${rapporteringsperiodeId}`, {
      statustext: godkjennPeriodeResponse.statusText,
    });

    return json({ error: "Klarte ikke sende timene dine til NAV, vennligst prøv igjen!" });
  }

  return redirect("/rapportering/sendt");
}

export default function RapporteringSendInn() {
  const { rapporteringsperiode } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;
  const actionData = useActionData<typeof action>();

  return (
    <>
      <Heading level="2" size="large" spacing>
        Send inn rapportering
      </Heading>

      <div className={styles.registertMeldeperiodeKontainer}>
        <Heading level="3" size="small">
          Dette er det du har registrert for meldeperioden:
        </Heading>
        <AktivitetOppsummering />
      </div>

      <div className={styles.utbetalingsEstimat}>
        <BodyShort>Estimert utbetaling: 13 245 kr</BodyShort>

        <ReadMore header="Se forklaring av estimat">
          Med helsemessige begrensninger mener vi funksjonshemming, sykdom, allergier som hindrer
          deg i arbeidet eller andre årsaker som må tas hensyn til når du skal finne nytt arbeid. Du
          må oppgi hva som gjelder for deg, og dokumentere de helsemessige årsakene du viser til.
        </ReadMore>
      </div>

      {actionData?.error && (
        <Alert variant="error" className={styles.feilmelding}>
          {actionData.error}
        </Alert>
      )}

      <Form method="post">
        <input
          type="text"
          hidden
          name="rapporteringsperiodeId"
          defaultValue={rapporteringsperiode.id}
        />

        <div className={styles.navigasjonKontainer}>
          <RemixLink to="/rapportering" as="Button" variant="secondary" icon={<Left />}>
            Forrige steg
          </RemixLink>
          <Button type="submit" variant="primary" icon={<Right />} iconPosition="right">
            Send til nav
          </Button>
        </div>
      </Form>
    </>
  );
}
