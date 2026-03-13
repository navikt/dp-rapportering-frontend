import { withZod } from "@rvf/zod";
import { parse } from "tinyduration";
import { z } from "zod";
import { zfd } from "zod-form-data";

import type { GetAppText } from "~/hooks/useSanity";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";
import { AktivitetType } from "~/utils/aktivitettype.utils";

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

export function valider(periode: IRapporteringsperiode, getAppText: GetAppText): string[] {
  const valideringMeldinger: string[] = [];

  periode.dager.forEach((dag) => {
    // validerIngenDuplikateAktivitetsTyper
    const aktivitetSet = new Set();
    dag.aktiviteter.forEach((aktivitet) => {
      aktivitetSet.add(aktivitet.type);
    });

    if (aktivitetSet.size !== dag.aktiviteter.length) {
      valideringMeldinger.push(
        dag.dato + " " + getAppText("rapportering-feilmelding-duplikate-aktivitets-typer"),
      );
    }

    // validerAktivitetsTypeKombinasjoner
    if (
      dag.aktiviteter.find((aktivitet) => aktivitet.type === AktivitetType.Arbeid) != null &&
      (dag.aktiviteter.find((aktivitet) => aktivitet.type === AktivitetType.Syk) != null ||
        dag.aktiviteter.find((aktivitet) => aktivitet.type === AktivitetType.Fravaer) != null)
    ) {
      valideringMeldinger.push(
        dag.dato + " " + getAppText("rapportering-feilmelding-ugyldig-aktivitetskombinasjon"),
      );
    }

    // validerArbeidedeTimer
    dag.aktiviteter.forEach((aktivitet) => {
      if (aktivitet.type === AktivitetType.Arbeid && aktivitet.timer) {
        const duration = parse(aktivitet.timer);
        const timer = duration.hours ?? 0;
        const minutter = duration.minutes ?? 0;

        if (
          timer < 0 ||
          minutter < 0 ||
          timer > 24 ||
          minutter > 59 ||
          (timer === 0 && minutter === 0) ||
          (timer === 24 && minutter > 0) ||
          minutter % 30 !== 0
        ) {
          valideringMeldinger.push(
            dag.dato + " " + getAppText("rapportering-feilmelding-ugyldige-timer"),
          );
        }
      }
    });

    // validerIngenArbeidedeTimerUtenArbeid
    dag.aktiviteter.forEach((aktivitet) => {
      if (
        (aktivitet.type === AktivitetType.Arbeid && !aktivitet.timer) ||
        (aktivitet.type !== AktivitetType.Arbeid && aktivitet.timer)
      ) {
        valideringMeldinger.push(
          dag.dato + " " + getAppText("rapportering-feilmelding-ugyldige-timer"),
        );
      }
    });
  });

  return valideringMeldinger;
}
