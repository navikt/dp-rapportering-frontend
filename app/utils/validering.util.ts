import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

const AktivitetstypeEnum = z.enum(["Arbeid", "Syk", "Utdanning", "Fravaer"]);

export const aktivitetsvalidering = z.object({
  type: zfd.repeatable(z.array(AktivitetstypeEnum).max(2, "Du kan velge maks to aktiviteter")),
  timer: z
    .preprocess(
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
    )
    .optional(),
});

export function validator() {
  return withZod(aktivitetsvalidering);
}

export function begrunnelseEndringValidator() {
  return withZod(
    z.object({ begrunnelseEndring: z.string().min(1, "Du må skrive en begrunnelse") })
  );
}
