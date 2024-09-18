import { ActionFunctionArgs } from "@remix-run/node";
import { lagreRapporteringstype } from "~/models/rapporteringstype.server";
import { Rapporteringstype } from "~/utils/types";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const rapporteringstype: Rapporteringstype = formData.get(
    "rapporteringstype"
  ) as Rapporteringstype;

  return await lagreRapporteringstype(request, rapporteringsperiodeId, rapporteringstype);
}
