import { faker } from "@faker-js/faker";
import { factory, nullable, primaryKey } from "@mswjs/data";
import { ScenerioType } from "~/devTools/";
import {
  lagForstRapporteringsperiode,
  leggTilForrigeRapporteringsperiode,
} from "~/devTools/rapporteringsperiode";
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
  model.rapporteringsperioder.create(lagForstRapporteringsperiode());
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
    orderBy: {
      periode: {
        fraOgMed: "asc",
      },
    },
  }) as IRapporteringsperiode[];
// ).sort((a, b) => compareAsc(parseISO(a.periode.fraOgMed), parseISO(b.periode.fraOgMed)));

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

const deleteAllInnsendteperioder = () => {
  const innsendteperioder = findAllInnsendtePerioder();

  innsendteperioder.forEach((periode) => {
    model.rapporteringsperioder.delete({
      where: {
        id: {
          equals: periode.id,
        },
      },
    });
  });
};

const findRapporteringsperioderByScenerio = (scenerio: ScenerioType): IRapporteringsperiode[] => {
  if (scenerio === ScenerioType.enkelt) {
    const perioder = findAllRapporteringsperioder();
    if (perioder.length > 1) {
      deleteAllRapporteringsperioder(
        perioder.filter((periode) => periode.id !== perioder.reverse()[0].id)
      );
    }
    return findAllRapporteringsperioder();
  }

  if (scenerio === ScenerioType.flere) {
    const rapporteringsperioder = findAllRapporteringsperioder();
    if (rapporteringsperioder.length === 1) {
      model.rapporteringsperioder.create(
        leggTilForrigeRapporteringsperiode(rapporteringsperioder[0].periode)
      );
    }
    return findAllRapporteringsperioder();
  } else if (scenerio === ScenerioType.reset) {
    const perioder = findAllRapporteringsperioder();

    if (perioder.length === 0) {
      model.rapporteringsperioder.create(lagForstRapporteringsperiode());
      return findAllRapporteringsperioder();
    }

    deleteAllRapporteringsperioder(
      perioder.filter((periode) => periode.id !== perioder.reverse()[0].id)
    );

    deleteAllInnsendteperioder();

    return findAllRapporteringsperioder();
  }
  return findAllRapporteringsperioder();
};

export function updateRapporteringsperioder(scenerio: ScenerioType) {
  switch (scenerio) {
    case ScenerioType.enkelt: {
      const perioder = findAllRapporteringsperioder();
      if (perioder.length > 1) {
        deleteAllRapporteringsperioder(
          perioder.filter((periode) => periode.id !== perioder.reverse()[0].id)
        );
      }
      break;
    }
    case ScenerioType.flere: {
      const rapporteringsperioder = findAllRapporteringsperioder();
      if (rapporteringsperioder.length === 1) {
        model.rapporteringsperioder.create(
          leggTilForrigeRapporteringsperiode(rapporteringsperioder[0].periode)
        );
      }
      break;
    }

    case ScenerioType.reset: {
      deleteAllInnsendteperioder();

      const perioder = findAllRapporteringsperioder();

      if (perioder.length === 0) {
        model.rapporteringsperioder.create(lagForstRapporteringsperiode());
        return findAllRapporteringsperioder();
      }

      deleteAllRapporteringsperioder(
        perioder.filter((periode) => periode.id !== perioder.reverse()[0].id)
      );

      return findAllRapporteringsperioder();
    }
  }
}

export const db = {
  ...model,
  seedRapporteringsperioder,
  updateRapporteringsperiode,
  findAllRapporteringsperioder,
  findAllInnsendtePerioder,
  findRapporteringsperiodeById,
  findRapporteringsperioderByScenerio,
};
