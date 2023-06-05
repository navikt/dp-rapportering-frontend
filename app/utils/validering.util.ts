import { z } from "zod";

export const aktivitetsvalideringArbeid = z.object({
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

export const aktivitetsvalideringSykFerie = aktivitetsvalideringArbeid.partial({ timer: true });
