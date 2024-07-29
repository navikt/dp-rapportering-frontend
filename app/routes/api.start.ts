import { ActionFunctionArgs, json } from "@remix-run/node";
import { startUtfylling } from "~/models/rapporteringsperiode.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  try {
    await startUtfylling(request, rapporteringsperiodeId);
    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error });
  }
}
