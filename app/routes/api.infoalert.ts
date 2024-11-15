import { LoaderFunctionArgs, json } from "@remix-run/node";
import { setInfoAlertStatus } from "~/models/info.server";

export async function action({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const formData = await request.formData();

  const showInfoAlert: boolean = formData.get("infoAlertStatus") === "true";

  return json(
    { status: "success" },
    {
      headers: {
        "Set-Cookie": await setInfoAlertStatus(cookieHeader, showInfoAlert),
      },
    }
  );
}
