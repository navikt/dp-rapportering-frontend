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

function findAllRapporteringsperioder(db: Database) {
  return db.rapporteringsperioder.findMany({
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
    case ScenerioType.en: {
      const perioder = findAllRapporteringsperioder(db);
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
      if (rapporteringsperioder.length === 1) {
        db.rapporteringsperioder.create(
          leggTilForrigeRapporteringsperiode(rapporteringsperioder[0].periode)
        );
      }
      break;
    }

    case ScenerioType.reset: {
      deleteAllInnsendteperioder(db);

      const perioder = findAllRapporteringsperioder(db);

      if (perioder.length === 0) {
        db.rapporteringsperioder.create(lagForstRapporteringsperiode());
        return findAllRapporteringsperioder(db);
      }

      deleteAllRapporteringsperioder(
        db,
        perioder.filter((periode) => periode.id !== perioder.reverse()[0].id)
      );

      return findAllRapporteringsperioder(db);
    }
  }
}

export const withDb = (db: Database) => {
  return {
    seedRapporteringsperioder: () => seedRapporteringsperioder(db),
    findAllRapporteringsperioder: () => findAllRapporteringsperioder(db),
    findAllInnsendtePerioder: () => findAllInnsendtePerioder(db),
    findRapporteringsperiodeById: (id: string) => findRapporteringsperiodeById(db, id),
    updateRapporteringsperiode: (id: string, data: Partial<IRapporteringsperiode>) =>
      updateRapporteringsperiode(db, id, data),
    lagreAktivitet: (rapporteringsperiodeId: string, dag: IRapporteringsperiodeDag) =>
      lagreAktivitet(db, rapporteringsperiodeId, dag),
    updateRapporteringsperioder: (scenerio: ScenerioType) =>
      updateRapporteringsperioder(db, scenerio),
  };
};
