import { ActionFunctionArgs } from "react-router";

import { slettAlleAktiviteterForRapporteringsperioden } from "~/models/aktivitet.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;

  if (!rapporteringsperiodeId || typeof rapporteringsperiodeId !== "string") {
    return new Response("Ugyldig rapporteringsperiodeId", { status: 400 });
  }

  return slettAlleAktiviteterForRapporteringsperioden(request, rapporteringsperiodeId);
}
