import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import type { TAktivitetType } from "~/models/aktivitet.server";

const aktivitetsvalideringArbeid = z.object({
  type: z.enum(["Arbeid", "Syk", "Ferie"], {
    errorMap: () => ({ message: "Du må velge et aktivitet" }),
  }),
  dato: z.coerce.date({
    invalid_type_error: "Ugyldig dato",
  }),
  timer: z.preprocess(
    (timer) => String(timer).replace(/,/g, "."),
    z.coerce
      .number({
        required_error: "Du må skrive et tall",
        invalid_type_error: "Det må være et gyldig tall",
      })
      .positive({ message: "Du må skrive et tall mellom 0,5 og 24 timer" })
      .min(0.5, { message: "Du må skrive et tall mellom 0,5 og 24 timer" })
      .max(24, { message: "Du må skrive et tall mellom 0,5 og 24 timer" })
      .step(0.5, { message: "Du kan bare føre hel eller halv time" })
  ),
});

const aktivitetsvalideringSykFerie = aktivitetsvalideringArbeid.partial({ timer: true });

export function validator(aktivitetType: TAktivitetType | string) {
  return aktivitetType === "Arbeid"
    ? withZod(aktivitetsvalideringArbeid)
    : withZod(aktivitetsvalideringSykFerie);
}
