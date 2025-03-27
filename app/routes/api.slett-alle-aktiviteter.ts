import { ActionFunctionArgs } from "@remix-run/node";

import { slettAlleAktiviteterForRapporteringsperioden } from "~/services/aktivitet.service";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;

  return slettAlleAktiviteterForRapporteringsperioden(request, rapporteringsperiodeId);
}
