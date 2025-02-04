export async function hash(string: string): Promise<string> {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function hentData<T extends object>(
  props: T = {} as T,
  språk: string,
  skjemanavn = "dagpenger-rapportering",
) {
  let skjemaId = "";

  if (Object.hasOwn(props, "skjemaId")) {
    skjemaId = await hash((props as { skjemaId: string }).skjemaId);
  }

  const data: { skjemanavn: string; språk: string; skjemaId?: string } & T = {
    skjemanavn,
    språk,
    ...props,
  };

  if (skjemaId) {
    data.skjemaId = skjemaId;
  }

  return data;
}
