import { ActionFunctionArgs } from "@remix-run/node";
import { startUtfylling } from "~/models/rapporteringsperiode.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;

  await startUtfylling(request, rapporteringsperiodeId);

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/periode/${rapporteringsperiodeId}/rapporteringstype`,
    },
  });
}
