import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { ScenarioType } from "~/devTools";
import { isLocalOrDemo } from "~/utils/env.utils";
import { withDb } from "../../mocks/responses/db";
import { getSessionId, sessionRecord } from "../../mocks/session";

export async function action({ request }: ActionFunctionArgs) {
  if (isLocalOrDemo) {
    const formData = await request.formData();

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
