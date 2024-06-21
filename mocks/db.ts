import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";
import { addDays, format, subDays } from "date-fns";
import { UtfyllingScenerioType } from "~/devTools/UtfyllingDevTools";
import { lagRapporteringsperioderUtenAktivitet } from "~/devTools/data";
import { IRapporteringsperiode } from "~/models/rapporteringsperiode.server";

const model = factory({
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

const seedRapporteringsperioder = () => {
  const rapporteringsperioderTilUtfylling = lagRapporteringsperioderUtenAktivitet(
    1,
    "TilUtfylling"
  );

  rapporteringsperioderTilUtfylling.forEach(model.rapporteringsperioder.create);
};

const updateRapporteringsperiode = (id: string, data: Partial<IRapporteringsperiode>) => {
  model.rapporteringsperioder.update({
    where: {
      id: {
        equals: id,
      },
    },
    data,
  });
};

const findAllRapporteringsperioder = () =>
  model.rapporteringsperioder.findMany({
    where: {
      status: {
        equals: "TilUtfylling",
      },
    },
  }) as IRapporteringsperiode[];

const findAllInnsendtePerioder = () =>
  model.rapporteringsperioder.findMany({
    where: {
      status: {
        equals: "Innsendt",
      },
    },
  }) as IRapporteringsperiode[];

const findRapporteringsperiodeById = (id: string) => {
  return model.rapporteringsperioder.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  }) as IRapporteringsperiode;
};

const deleteAllRapporteringsperioder = (perioder: IRapporteringsperiode[]) => {
  perioder.forEach((periode) => {
    model.rapporteringsperioder.delete({
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
      const ny = lagRapporteringsperioderUtenAktivitet(1, "TilUtfylling")[0];
      const { fraOgMed, tilOgMed } = getNestePeriodeDato(perioder[0]);
      const periode: IRapporteringsperiode = {
        ...ny,
        periode: {
          ...ny.periode,
          fraOgMed,
          tilOgMed,
        },
      };

      model.rapporteringsperioder.create(periode);
    }
    return findAllRapporteringsperioder();
  } else if (scenerio === UtfyllingScenerioType.reset) {
    const perioder = findAllRapporteringsperioder();

    if (perioder.length === 0) {
      const periode = lagRapporteringsperioderUtenAktivitet(1, "TilUtfylling")[0];
      model.rapporteringsperioder.create(periode);
      return findAllRapporteringsperioder();
    }

    deleteAllRapporteringsperioder(perioder.filter((periode) => periode.id !== perioder[0].id));
    return findAllRapporteringsperioder();
  }
  return findAllRapporteringsperioder();
};

export const db = {
  ...model,
  seedRapporteringsperioder,
  updateRapporteringsperiode,
  findAllRapporteringsperioder,
  findAllInnsendtePerioder,
  findRapporteringsperiodeById,
  findRapporteringsperioderByScenerio,
};
