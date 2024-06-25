import { Alert, Button, Heading } from "@navikt/ds-react";
import { PortableText } from "@portabletext/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { logger } from "~/models/logger.server";
import { godkjennPeriode } from "~/models/rapporteringsperiode.server";
import styles from "~/routes-styles/rapportering.module.css";
import { getRapporteringOboToken } from "~/utils/auth.utils.server";
import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "~/components/RemixLink";

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

  return redirect(`/korriger/${periodeId}/bekreftelse`);
}

export default function KorrigeringSendInnSide() {
  const actionData = useActionData<typeof action>();
  const { rapporteringsperiodeId } = useParams();
  const { getLink, getRichText, getAppText } = useSanity();

  return (
    <>
      <div className="rapportering-container">
        <Heading tabIndex={-1} level="2" size="medium" spacing className="vo-fokus">
          {getAppText("rapportering-korriger-send-inn-tittel")}
        </Heading>
        <PortableText value={getRichText("rapportering-send-inn-innhold")} />

        {actionData?.error && (
          <Alert variant="error" className={styles.feilmelding}>
            {actionData.error}
          </Alert>
        )}

        <Form method="post">
          <div className="navigasjon-container">
            <RemixLink
              to={`/korriger/${rapporteringsperiodeId}/fyll-ut`}
              as="Button"
              variant="secondary"
            >
              {getLink("rapportering-korriger-send-inn-tilbake").linkText}
            </RemixLink>

            <Button type="submit" variant="primary" iconPosition="right">
              {getLink("rapportering-korriger-send-inn-bekreft").linkText}
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
