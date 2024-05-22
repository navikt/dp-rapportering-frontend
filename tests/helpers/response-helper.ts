export async function catchErrorResponse(fn: () => Promise<Response>): Promise<Response> {
  try {
    const res = await fn();
    return res;
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
