import { faker } from "@faker-js/faker";
import { factory, primaryKey } from "@mswjs/data";
import {
  lagInnsendteRapporteringsperiodeMedArbeidAktivitet,
  lagInnsendteRapporteringsperiodeMedArbeidSykOgFravaer,
  lagInnsendteRapporteringsperioderUtenAktivitet,
} from "~/devTools/data";

export const mockDb = factory({
  innsendteRapporteringsperioder: {
    id: primaryKey(faker.datatype.uuid),
    periode: {
      fraOgMed: () => faker.date.recent().toISOString(),
      tilOgMed: () => faker.date.future().toISOString(),
    },
    dager: Array,
    status: faker.string.alpha,
    kanSendesFra: () => faker.date.recent().toISOString(),
    kanSendes: faker.datatype.boolean,
    kanKorrigeres: faker.datatype.boolean,
  },
});

const innsendtRapporteringsperioder = [
  ...lagInnsendteRapporteringsperiodeMedArbeidSykOgFravaer(3),
  ...lagInnsendteRapporteringsperiodeMedArbeidAktivitet(3),
  ...lagInnsendteRapporteringsperioderUtenAktivitet(3),
];

innsendtRapporteringsperioder.forEach(mockDb.innsendteRapporteringsperioder.create);
