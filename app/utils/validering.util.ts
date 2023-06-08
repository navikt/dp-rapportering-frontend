import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { TAktivitetType } from "~/models/aktivitet.server";

const aktivitetsvalideringArbeid = z.object({
  type: z.enum(["Arbeid", "Syk", "Ferie"], {
    errorMap: () => ({ message: "Du må velge et aktivitet" }),
  }),
  dato: z.coerce.date({
    invalid_type_error: "Ugyldig dato",
  }),
  timer: z
    .string()
    .nonempty({ message: "Du må skrive et tall" })
    .regex(new RegExp("^\\d*(,)?\\d*$"), "Det må være et gyldig tall"), // Regex for å matche tall med komma seperator
});

const aktivitetsvalideringSykFerie = aktivitetsvalideringArbeid.partial({ timer: true });

export function validator(aktivitetType: TAktivitetType) {
  return aktivitetType === "Arbeid"
    ? withZod(aktivitetsvalideringArbeid)
    : withZod(aktivitetsvalideringSykFerie);
}
