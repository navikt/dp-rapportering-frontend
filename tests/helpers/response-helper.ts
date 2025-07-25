import { UNSAFE_DataWithResponseInit } from "react-router";

export async function catchErrorResponse(
  fn: () => Promise<unknown>,
): Promise<Response | UNSAFE_DataWithResponseInit<{ error: string }>> {
  try {
    const res = await fn();
    return res as Response;
  } catch (e) {
    if (e instanceof Response) {
      return e;
    } else if (e instanceof Error) {
      throw e;
    } else {
      throw new Error("Noe skjedde feil");
    }
  }
}
