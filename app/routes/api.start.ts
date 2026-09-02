import { ActionFunctionArgs } from "react-router";

import { logg } from "~/models/logger.server";
import { startUtfylling } from "~/models/rapporteringsperiode.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rapporteringsperiodeId = formData.get("rapporteringsperiodeId") as string;

  try {
    await startUtfylling(request, rapporteringsperiodeId);
  } catch (error: unknown) {
    if (error instanceof Response) {
      logg({
        type: "error",
        message: "Feil ved start av utfylling",
        correlationId:
          error.headers.get("x-request-id") ?? error.headers.get("x-correlation-id"),
        body: {
          status: error.status,
          body: await error.clone().text(),
        },
      });

      return error;
    }

    logg({
      type: "error",
      message: "Feil ved start av utfylling",
      correlationId: null,
      body: error instanceof Error ? error.message : error,
    });

    return new Response("rapportering-feilmelding-start-utfylling", { status: 500 });
  }

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/periode/${rapporteringsperiodeId}/rapporteringstype`,
    },
  });
}
