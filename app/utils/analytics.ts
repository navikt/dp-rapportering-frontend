export async function hash(string: string): Promise<string> {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

export async function hentData<T extends object>({
  props = {} as T,
  språk,
  skjemanavn = "dagpenger-rapportering",
}: {
  props: T;
  språk: string;
  skjemanavn: string;
}) {
  let skjemaId = "";
  if (Object.hasOwn(props, "skjemaId")) {
    skjemaId = await hash((props as { skjemaId: string }).skjemaId);
  }

  let sesjonId = "";
  if (Object.hasOwn(props, "sesjonId")) {
    sesjonId = await hash((props as { sesjonId: string }).sesjonId);
  }

  const data: { skjemanavn: string; språk: string; skjemaId?: string; sesjonId?: string } & T = {
    skjemanavn,
    språk,
    ...props,
  };

  if (skjemaId) {
    data.skjemaId = skjemaId;
  }

  if (sesjonId) {
    data.sesjonId = sesjonId;
  }

  return data;
}

export const periodeIdRegex = "periode/.+/";
export const periodeIdRedacted = "periode/[rapporteringsId]/";

export function redactId(url: string): string {
  if (!url || typeof url !== "string") return url;

  return url.replace(new RegExp(periodeIdRegex, "g"), periodeIdRedacted);
}
