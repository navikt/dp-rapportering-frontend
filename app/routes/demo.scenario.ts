import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { withDb } from "mocks/responses/db";
import { getSessionId, sessionRecord } from "mocks/session";
import { ScenarioType } from "~/devTools";
import { isLocalOrDemo } from "~/utils/env.utils";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  if (isLocalOrDemo) {
    const { type: scenario } = Object.fromEntries(formData);
    const sessionId = getSessionId(request);

    if (sessionId) {
      withDb(sessionRecord.getDatabase(sessionId)).updateRapporteringsperioder(
        scenario as ScenarioType
      );

      return redirect("/");
    }
  }

  return { status: "success" };
}
