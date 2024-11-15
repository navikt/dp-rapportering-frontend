export async function catchErrorResponse(fn: () => Promise<unknown>): Promise<Response> {
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
