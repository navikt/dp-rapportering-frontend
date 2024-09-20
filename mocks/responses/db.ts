import { format, getWeek, getYear, subDays } from "date-fns";
import { Database } from "mocks/session";
import { ScenarioType } from "~/devTools";
import {
  beregnNåværendePeriodeDato,
  formatereDato,
  lagPeriodeDatoFor,
} from "~/devTools/periodedato";
import {
  lagForstRapporteringsperiode,
  lagRapporteringsperiode,
  leggTilForrigeRapporteringsperiode,
} from "~/devTools/rapporteringsperiode";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
  IRapporteringsperiodeStatus,
} from "~/models/rapporteringsperiode.server";
import { Rapporteringstype } from "~/utils/types";

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
    orderBy: {
      periode: {
        fraOgMed: "desc",
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

function deleteAllRapporteringsperioder(db: Database) {
  const perioder = db.rapporteringsperioder.findMany({}) as IRapporteringsperiode[];

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

export function updateRapporteringsperioder(db: Database, scenario: ScenarioType) {
  switch (scenario) {
    case ScenarioType.ingen: {
      deleteAllRapporteringsperioder(db);
      break;
    }

    case ScenarioType.fremtidig: {
      deleteAllRapporteringsperioder(db);

      const uke = getWeek(new Date(), { weekStartsOn: 1 });
      const år = getYear(new Date());

      const periode = lagPeriodeDatoFor(uke, år);

      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          kanSendes: false,
          periode,
          kanSendesFra: format(subDays(new Date(periode.tilOgMed), 1), "yyyy-MM-dd"),
        })
      );
      break;
    }

    case ScenarioType.reset:
    case ScenarioType.en: {
      deleteAllRapporteringsperioder(db);
      db.rapporteringsperioder.create(lagForstRapporteringsperiode());
      break;
    }

    case ScenarioType.to: {
      deleteAllRapporteringsperioder(db);
      db.rapporteringsperioder.create(lagForstRapporteringsperiode());
      db.rapporteringsperioder.create(
        leggTilForrigeRapporteringsperiode(findAllRapporteringsperioder(db)[0].periode)
      );
      break;
    }

    case ScenarioType.innsendte: {
      deleteAllRapporteringsperioder(db);

      const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

      const periode1 = {
        fraOgMed: formatereDato(subDays(new Date(fraOgMed), 14)),
        tilOgMed: formatereDato(subDays(new Date(fraOgMed), 1)),
      };

      const periode2 = {
        fraOgMed: formatereDato(subDays(new Date(fraOgMed), 28)),
        tilOgMed: formatereDato(subDays(new Date(fraOgMed), 15)),
      };

      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          kanSendes: false,
          status: IRapporteringsperiodeStatus.Innsendt,
          rapporteringstype: Rapporteringstype.harAktivitet,
          periode: periode1,
          kanSendesFra: format(subDays(new Date(periode1.tilOgMed), 1), "yyyy-MM-dd"),
        })
      );

      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          kanSendes: false,
          rapporteringstype: Rapporteringstype.harAktivitet,
          status: IRapporteringsperiodeStatus.Innsendt,
          periode: periode2,
          kanSendesFra: format(subDays(new Date(periode2.fraOgMed), 1), "yyyy-MM-dd"),
        })
      );

      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          periode: {
            fraOgMed,
            tilOgMed,
          },
        })
      );
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
    deleteAllInnsendteperioder: () => deleteAllInnsendteperioder(db),
    updateRapporteringsperioder: (scenario: ScenarioType) =>
      updateRapporteringsperioder(db, scenario),
  };
};
