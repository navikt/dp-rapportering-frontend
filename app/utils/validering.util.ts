import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";

export const validerSkjema = withZod(
  z.object({
    type: z.enum(["arbeid", "sykdom", "ferie"], {
      invalid_type_error: "Ugyldig aktivitets type",
    }),
    dato: z.coerce.date({
      invalid_type_error: "Ugyldig dato",
    }),
    timer: z
      .string()
      .nonempty("Du må skrive et tall")
      .regex(new RegExp("^\\d*(,)?\\d*$"), "Det må være et gyldig tall"), // Regex for å matche tall med komma seperator
  })
);
