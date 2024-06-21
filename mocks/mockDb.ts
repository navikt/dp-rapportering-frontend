import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";
import { addDays, format, subDays } from "date-fns";
import { UtfyllingScenerioType } from "~/devTools/UtfyllingDevTools";
import {
  lagInnsendteRapporteringsperiodeMedArbeidAktivitet,
  lagInnsendteRapporteringsperiodeMedArbeidOgUtdanning,
  lagInnsendteRapporteringsperiodeMedArbeidSykOgFravaer,
  lagInnsendteRapporteringsperiodeMedUtdanning,
  lagInnsendteRapporteringsperioderUtenAktivitet,
  lagRapporteringsperiodeMedArbeidAktivitet,
  lagRapporteringsperioderUtenAktivitet,
} from "~/devTools/data";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

const mockDb = factory({
  rapporteringsperioder: {
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
    registrertArbeidssoker: nullable(faker.datatype.boolean),
  },
});

export const seedInnsendtePerioder = () => {
  const innsendtRapporteringsperioder = [
    ...lagInnsendteRapporteringsperiodeMedUtdanning(1),
    ...lagInnsendteRapporteringsperiodeMedArbeidOgUtdanning(1),
    ...lagInnsendteRapporteringsperiodeMedArbeidSykOgFravaer(1),
    ...lagInnsendteRapporteringsperiodeMedArbeidAktivitet(1),
    ...lagInnsendteRapporteringsperioderUtenAktivitet(1),
  ];

  innsendtRapporteringsperioder.forEach(mockDb.rapporteringsperioder.create);
};

const seedRapporteringsperioder = () => {
  const rapporteringsperioderTilUtfylling = lagRapporteringsperioderUtenAktivitet(
    1,
    "TilUtfylling"
  );

  rapporteringsperioderTilUtfylling.forEach(mockDb.rapporteringsperioder.create);
};

const seed = () => {
  seedRapporteringsperioder();
};

const update = (id: string, data: Partial<IRapporteringsperiode>) => {
  mockDb.rapporteringsperioder.update({
    where: {
      id: {
        equals: id,
      },
    },
    data,
  });
};

const findAllByStatus = (status: IRapporteringsperiode["status"]) =>
  mockDb.rapporteringsperioder.findMany({
    where: {
      status: {
        equals: status,
      },
    },
  }) as IRapporteringsperiode[];

const findAllRapporteringsperioder = () =>
  mockDb.rapporteringsperioder.findMany({
    where: {
      status: {
        equals: "TilUtfylling",
      },
    },
  }) as IRapporteringsperiode[];

const findAllInnsendtePerioder = () =>
  mockDb.rapporteringsperioder.findMany({
    where: {
      status: {
        equals: "Innsendt",
      },
    },
  }) as IRapporteringsperiode[];

const findRapporteringsperiodeById = (id: string) => {
  return mockDb.rapporteringsperioder.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  }) as IRapporteringsperiode;
};

// create new rapporteringsperiode

const createRapporteringsperiode = (): IRapporteringsperiode => {
  const periode = lagRapporteringsperioderUtenAktivitet(1, "TilUtfylling")[0];

  return mockDb.rapporteringsperioder.create(periode) as IRapporteringsperiode;
};

const deleteLastRapporteringsperiode = () => {
  const perioder = findAllByStatus("TilUtfylling");
  const { id } = perioder[perioder.length - 1];

  mockDb.rapporteringsperioder.delete({
    where: {
      id: {
        equals: id,
      },
    },
  });
};

const deleteAllRapporteringsperioder = (perioder: IRapporteringsperiode[]) => {
  perioder.forEach((periode) => {
    mockDb.rapporteringsperioder.delete({
      where: {
        id: {
          equals: periode.id,
        },
      },
    });
  });
};

const getNestePeriodeDato = (rapporteringsperiode: IRapporteringsperiode) => {
  const fraOgMed = format(subDays(rapporteringsperiode.periode.fraOgMed, 14), "yyyy-MM-dd");
  const tilOgMed = format(addDays(fraOgMed, 13), "yyyy-MM-dd");
  return {
    fraOgMed,
    tilOgMed,
  };
};

const findRapporteringsperioderByScenerio = (
  scenerio: UtfyllingScenerioType
): IRapporteringsperiode[] => {
  if (scenerio === UtfyllingScenerioType.enkelt) {
    const perioder = findAllRapporteringsperioder();
    if (perioder.length > 1) {
      deleteAllRapporteringsperioder(perioder.filter((periode) => periode.id !== perioder[0].id));
    }
    return findAllRapporteringsperioder();
  }

  if (scenerio === UtfyllingScenerioType.flere) {
    const perioder = findAllRapporteringsperioder();
    if (perioder.length === 1) {
      const ny = lagRapporteringsperiodeMedArbeidAktivitet(1, "TilUtfylling")[0];
      const { fraOgMed, tilOgMed } = getNestePeriodeDato(perioder[0]);
      const periode: IRapporteringsperiode = {
        ...ny,
        periode: {
          ...ny.periode,
          fraOgMed,
          tilOgMed,
        },
      };

      mockDb.rapporteringsperioder.create(periode);
    }
    return findAllRapporteringsperioder();
  } else if (scenerio === UtfyllingScenerioType.reset) {
    const perioder = findAllRapporteringsperioder();

    if (perioder.length === 0) {
      const periode = lagRapporteringsperioderUtenAktivitet(1, "TilUtfylling")[0];
      mockDb.rapporteringsperioder.create(periode);
      return findAllRapporteringsperioder();
    }

    deleteAllRapporteringsperioder(perioder.filter((periode) => periode.id !== perioder[0].id));
    return findAllRapporteringsperioder();
  }
  return findAllRapporteringsperioder();
};

export const db = {
  ...mockDb,
  seed,
  createRapporteringsperiode,
  update,
  findAllByStatus,
  findAllRapporteringsperioder,
  findAllInnsendtePerioder,
  findRapporteringsperioderByScenerio,
  findRapporteringsperiodeById,
  deleteLastRapporteringsperiode,
};
