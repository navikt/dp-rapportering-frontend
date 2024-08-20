import { ActionFunctionArgs } from "@remix-run/node";
import { lagreBegrunnelse } from "~/models/begrunnelse.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const begrunnelseEndring: string = formData.get("begrunnelseEndring") as string;

  return await lagreBegrunnelse(request, rapporteringsperiodeId, begrunnelseEndring);
}
