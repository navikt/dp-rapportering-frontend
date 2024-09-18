import { ActionFunctionArgs, json } from "@remix-run/node";
import { startUtfylling } from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/utils/types";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const rapporteringstype = formData.get("rapporteringstype") as string;
  console.log(rapporteringsperiodeId, rapporteringstype);

  try {
    await startUtfylling(request, rapporteringsperiodeId);

    if (rapporteringstype === Rapporteringstype.harIngenAktivitet) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: `/periode/${rapporteringsperiodeId}/arbeidssoker`,
        },
      });
    }

    return new Response(null, {
      status: 303,
      headers: {
        Location: `/periode/${rapporteringsperiodeId}/fyll-ut`,
      },
    });
  } catch (error) {
    return json({ status: "error", error });
  }
}
