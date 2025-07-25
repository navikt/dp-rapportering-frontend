import { withZod } from "@rvf/zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

const AktivitetstypeEnum = z.enum(["Arbeid", "Syk", "Utdanning", "Fravaer"]);

export const aktivitetsvalidering = z.object({
  type: zfd.repeatable(z.array(AktivitetstypeEnum)),
  timer: z
    .preprocess(
      (timer) => String(timer).replace(/,/g, "."),
      z.coerce
        .number({
          error: (issue) =>
            issue.input === undefined
              ? "rapportering-feilmelding-ma-skrive-tall"
              : "rapportering-feilmelding-ugyldig-tall",
        })
        .positive({ message: "rapportering-feilmelding-ma-skrive-positivt-tall" })
        .min(0.5, { message: "rapportering-feilmelding-ma-skrive-positivt-tall" })
        .max(24, { message: "rapportering-feilmelding-ma-skrive-positivt-tall" })
        .multipleOf(0.5, { message: "rapportering-feilmelding-hel-halv-time" }),
    )
    .optional(),
});

export function validator() {
  return withZod(aktivitetsvalidering);
}

export function begrunnelseEndringValidator() {
  return withZod(
    z.object({
      begrunnelseEndring: z.string().min(1, "rapportering-feilmelding-ma-ha-begrunnelse"),
    }),
  );
}
