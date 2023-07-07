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
import { type IRapporteringLoader } from "~/routes/rapportering";

export default function PeriodelistVisning() {
  const { allePerioder } = useRouteLoaderData("routes/rapportering") as IRapporteringLoader;

  console.log("allePerioder", allePerioder);

  function aapneModal() {
    // TODO
  }

  return (
    <ul>
      {allePerioder?.map((periode: IRapporteringsperiode) => (
        <li key={periode.id}>
          {periode.fraOgMed} {periode.tilOgMed} - {periode.status} ({periode.id})
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
          <Kalender rapporteringsperiode={periode} aapneModal={aapneModal} />
        </li>
      ))}
    </ul>
  );
}
