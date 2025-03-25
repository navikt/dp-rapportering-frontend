import { ActionFunctionArgs } from "@remix-run/node";

import { slettAlleAktiviteterForBestemtDag } from "~/utils/aktivitet.action.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;

  return slettAlleAktiviteterForBestemtDag(request, rapporteringsperiodeId, formData);
}
