import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withDb } from "mocks/responses/db";
import { getSessionId, sessionRecord } from "mocks/session";
import { ScenerioType } from "~/devTools";
import { resetRapporteringstypeCookie } from "~/models/rapporteringstype.server";
import { isLocalOrDemo } from "~/utils/env.utils";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (isLocalOrDemo) {
    const { type: scenerio } = Object.fromEntries(formData);
    const sessionId = getSessionId(request);

    if (sessionId) {
      withDb(sessionRecord.getDatabase(sessionId)).updateRapporteringsperioder(
        scenerio as ScenerioType
      );

      return redirect("/", {
        headers: {
          "Set-Cookie": await resetRapporteringstypeCookie(),
        },
      });
    }
  }

  return { status: "success" };
}
