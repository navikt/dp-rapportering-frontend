import { Heading } from "@navikt/ds-react";
import { type ActionArgs } from "@remix-run/node";
import PeriodelistVisning from "~/components/periodeliste-visning/PeriodelisteVisning";
import { avgodkjennPeriode } from "~/models/rapporteringsperiode.server";
import { startKorrigeringAction } from "~/utils/rapporteringsperiode.action.server";

export async function action({ request }: ActionArgs) {
  const formdata = await request.formData();
  const submitKnapp = formdata.get("submit");

  switch (submitKnapp) {
    case "start-korrigering": {
      return await startKorrigeringAction(formdata, request);
    }

    case "avgodkjenn": {
      const periodeId = formdata.get("periode-id") as string;

      return await avgodkjennPeriode(periodeId, request);
    }
  }
}

export default function VisAlle() {
  return (
    <>
      <Heading level="2" size="large" spacing>
        VIS ALLE PERIODER
      </Heading>

      <PeriodelistVisning />
    </>
  );
}
