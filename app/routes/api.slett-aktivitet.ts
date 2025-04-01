import { ActionFunctionArgs } from "@remix-run/node";

import { lagreAktivitet } from "~/models/aktivitet.server";
import { IRapporteringsperiodeDag } from "~/models/rapporteringsperiode.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const dag: IRapporteringsperiodeDag = JSON.parse(String(formData.get("dag")));

  const oppdatertDag = { ...dag, aktiviteter: [] };

  return await lagreAktivitet(request, rapporteringsperiodeId, oppdatertDag);
}
