import { z } from "zod";

export const aktivitetsvalideringArbeid = z.object({
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
      .positive({ message: "Arbeidstime kan ikke være et nagativt" })
      .min(0.5, { message: "Arbeidstime må være mer enn 0,5 timer" })
      .max(24, { message: "Arbeidstime være mellom 0,5 og 24 timer" })
  ),
});

export const aktivitetsvalideringSykFerie = aktivitetsvalideringArbeid.partial({ timer: true });
