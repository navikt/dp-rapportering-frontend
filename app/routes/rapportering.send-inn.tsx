import { ArrowLeftIcon, ArrowRightIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, Button, Heading, ReadMore } from "@navikt/ds-react";
import { ActionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useRouteLoaderData } from "@remix-run/react";
import { logger } from "server/logger";
import invariant from "tiny-invariant";
import { RemixLink } from "~/components/RemixLink";
import { AktivitetOppsummering } from "~/components/aktivitet-oppsummering/AktivitetOppsummering";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import { IRapporteringLoader } from "./rapportering";

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

    return json({ error: "Det har skjedd noe feil med innsendingen din, prøv igjen." });
  }

  return redirect("/rapportering/innsendt");
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
          <RemixLink
            to="/rapportering"
            as="Button"
            variant="secondary"
            icon={<ArrowLeftIcon fontSize="1.5rem" />}
          >
            Forrige steg
          </RemixLink>
          <Button
            type="submit"
            variant="primary"
            icon={<ArrowRightIcon fontSize="1.5rem" />}
            iconPosition="right"
          >
            Send til nav
          </Button>
        </div>
      </Form>
    </>
  );
}
