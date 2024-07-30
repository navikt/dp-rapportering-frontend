import { ActionFunctionArgs } from "@remix-run/node";
import { lagreArbeidssokerSvar } from "~/models/arbeidssoker.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;
  const registrertArbeidssoker: boolean = formData.get("registrertArbeidssoker") === "true";

  return await lagreArbeidssokerSvar(request, rapporteringsperiodeId, {
    registrertArbeidssoker,
  });
}
