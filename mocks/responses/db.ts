import { Database } from "mocks/session";
import { ScenerioType } from "~/devTools";
import {
  lagForstRapporteringsperiode,
  leggTilForrigeRapporteringsperiode,
} from "~/devTools/rapporteringsperiode";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";

function seedRapporteringsperioder(db: Database) {
  db.rapporteringsperioder.create(lagForstRapporteringsperiode());
}

function addRapporteringsperioder(db: Database, rapporteringsperiode: IRapporteringsperiode) {
  db.rapporteringsperioder.create(rapporteringsperiode);
}

function findAllRapporteringsperioder(db: Database) {
  return db.rapporteringsperioder.findMany({
    where: {
      status: {
        in: ["TilUtfylling"],
      },
    },
    orderBy: {
      periode: {
        fraOgMed: "asc",
      },
    },
  }) as IRapporteringsperiode[];
}

function findAllInnsendtePerioder(db: Database) {
  return db.rapporteringsperioder.findMany({
    where: {
      status: {
        equals: "Innsendt",
      },
    },
  }) as IRapporteringsperiode[];
}

function findRapporteringsperiodeById(db: Database, id: string) {
  return db.rapporteringsperioder.findFirst({
    where: {
      id: {
        equals: id,
      },
    },
  }) as IRapporteringsperiode;
}

function updateRapporteringsperiode(
  db: Database,
  id: string,
  data: Partial<IRapporteringsperiode>
) {
  return db.rapporteringsperioder.update({
    where: {
      id: {
        equals: id,
      },
    },
    data,
  });
}

function lagreAktivitet(
  db: Database,
  rapporteringsperiodeId: string,
  dag: IRapporteringsperiodeDag
) {
  const periode = findRapporteringsperiodeById(db, rapporteringsperiodeId);

  if (periode) {
    const oppdatertDager = periode.dager.map((d) => {
      if (d.dato === dag.dato) {
        return dag;
      }
      return d;
    });

    db.rapporteringsperioder.update({
      where: {
        id: {
          equals: rapporteringsperiodeId,
        },
      },
      data: {
        dager: oppdatertDager,
      },
    });
  }
}

function deleteAllRapporteringsperioder(db: Database, perioder: IRapporteringsperiode[]) {
  perioder.forEach((periode) => {
    db.rapporteringsperioder.delete({
      where: {
        id: {
          equals: periode.id,
        },
      },
    });
  });
}

const deleteAllInnsendteperioder = (db: Database) => {
  const innsendteperioder = findAllInnsendtePerioder(db);

  innsendteperioder.forEach((periode) => {
    db.rapporteringsperioder.delete({
      where: {
        id: {
          equals: periode.id,
        },
      },
    });
  });
};

export function updateRapporteringsperioder(db: Database, scenerio: ScenerioType) {
  switch (scenerio) {
    case ScenerioType.ingen: {
      deleteAllRapporteringsperioder(db, findAllRapporteringsperioder(db));
      break;
    }
    case ScenerioType.en: {
      const perioder = findAllRapporteringsperioder(db);

      if (perioder.length === 0) {
        db.rapporteringsperioder.create(lagForstRapporteringsperiode());
      }

      if (perioder.length > 1) {
        deleteAllRapporteringsperioder(
          db,
          perioder.filter((periode) => periode.id !== perioder.reverse()[0].id)
        );
      }
      break;
    }
    case ScenerioType.to: {
      const rapporteringsperioder = findAllRapporteringsperioder(db);

      if (rapporteringsperioder.length === 0) {
        db.rapporteringsperioder.create(lagForstRapporteringsperiode());
        db.rapporteringsperioder.create(
          leggTilForrigeRapporteringsperiode(findAllRapporteringsperioder(db)[0].periode)
        );
      }

      if (rapporteringsperioder.length === 1) {
        db.rapporteringsperioder.create(
          leggTilForrigeRapporteringsperiode(rapporteringsperioder[0].periode)
        );
      }
      break;
    }

    case ScenerioType.reset: {
      deleteAllInnsendteperioder(db);
      deleteAllRapporteringsperioder(db, findAllRapporteringsperioder(db));
      db.rapporteringsperioder.create(lagForstRapporteringsperiode());

      return findAllRapporteringsperioder(db);
    }
  }
}

function deleteRapporteringsperiode(db: Database, id: string) {
  db.rapporteringsperioder.delete({
    where: {
      id: {
        equals: id,
      },
    },
  });
}

export const withDb = (db: Database) => {
  return {
    seedRapporteringsperioder: () => seedRapporteringsperioder(db),
    addRapporteringsperioder: (rapporteringsperiode: IRapporteringsperiode) =>
      addRapporteringsperioder(db, rapporteringsperiode),
    findAllRapporteringsperioder: () => findAllRapporteringsperioder(db),
    findAllInnsendtePerioder: () => findAllInnsendtePerioder(db),
    findRapporteringsperiodeById: (id: string) => findRapporteringsperiodeById(db, id),
    updateRapporteringsperiode: (id: string, data: Partial<IRapporteringsperiode>) =>
      updateRapporteringsperiode(db, id, data),
    deleteRapporteringsperiode: (id: string) => deleteRapporteringsperiode(db, id),
    lagreAktivitet: (rapporteringsperiodeId: string, dag: IRapporteringsperiodeDag) =>
      lagreAktivitet(db, rapporteringsperiodeId, dag),
    updateRapporteringsperioder: (scenerio: ScenerioType) =>
      updateRapporteringsperioder(db, scenerio),
  };
};
