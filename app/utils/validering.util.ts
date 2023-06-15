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
  timer: z.preprocess(
    (timer) => String(timer).replace(/,/g, "."),
    z.coerce
      .number({
        required_error: "Du må skrive et tall",
        invalid_type_error: "Det må være et gyldig tall",
      })
      .positive({ message: "Det må være mellom 0,5 og 24 timer" })
      .min(0.5, { message: "Det må være mer enn 0,5 timer" })
      .max(24, { message: "Det må være mellom 0,5 og 24 timer" })
  ),
});

const aktivitetsvalideringSykFerie = aktivitetsvalideringArbeid.partial({ timer: true });

export function validator(aktivitetType: TAktivitetType | string) {
  return aktivitetType === "Arbeid"
    ? withZod(aktivitetsvalideringArbeid)
    : withZod(aktivitetsvalideringSykFerie);
}
