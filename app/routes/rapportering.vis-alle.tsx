import { Button, Heading } from "@navikt/ds-react";
import { json, redirect, type ActionArgs } from "@remix-run/node";
import { Form, useRouteLoaderData } from "@remix-run/react";
import { RemixLink } from "~/components/RemixLink";
import { Kalender } from "~/components/kalender/Kalender";
import {
  avgodkjennPeriode,
  startKorrigering,
  type IRapporteringsperiode,
} from "~/models/rapporteringsperiode.server";
import { type IRapporteringLoader } from "./rapportering";

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "start-korrigering": {
      const periodeId = formdata.get("periode-id") as string;

      const korrigeringResponse = await startKorrigering(periodeId, request);

      if (korrigeringResponse.ok) {
        const korrigeringsperiode: IRapporteringsperiode = await korrigeringResponse.json();
        return redirect(`/rapportering/endre/${korrigeringsperiode.id}`);
      } else {
        json({ korrigeringsfeil: true });
      }
    }

    case "avgodkjenn": {
      const periodeId = formdata.get("periode-id") as string;

      return await avgodkjennPeriode(periodeId, request);
    }
  }
}

export default function VisAlle() {
  const { allePerioder } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;

  function aapneModal() {
    // TODO
  }

  return (
    <>
      <Heading level="2" size="large" spacing>
        VIS ALLE PERIODER
      </Heading>

      <ul>
        {allePerioder?.map((periode: IRapporteringsperiode) => (
          <li key={periode.id}>
            {periode.fraOgMed} {periode.tilOgMed} - {periode.status} ({periode.id})
            <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
            <Form method="post">
              <input type="hidden" name="periode-id" value={periode.id}></input>
              {periode.status === "TilUtfylling" && (
                <RemixLink as="Button" to={`/rapportering/endre/${periode.id}`}>
                  Fyll ut
                </RemixLink>
              )}
              {periode.status === "Godkjent" && (
                <Button type="submit" name="submit" value="avgodkjenn">
                  Lås opp og rediger
                </Button>
              )}
              {periode.status === "Innsendt" && (
                <Button type="submit" name="submit" value="start-korrigering">
                  Korriger
                </Button>
              )}
            </Form>
          </li>
        ))}
      </ul>
    </>
  );
}
