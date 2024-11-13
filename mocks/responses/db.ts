import { addDays, format, getWeek, getYear, subDays } from "date-fns";
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
} from "~/models/rapporteringsperiode.server";
import { IRapporteringsperiodeStatus, Rapporteringstype } from "~/utils/types";
import { Database } from "../../mocks/session";

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
        in: ["Innsendt", "Endret", "Ferdig", "Feilet"],
      },
    },
    orderBy: [
      {
        mottattDato: "desc",
      },
      {
        originalId: "asc",
      },
    ],
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

      const periode1KanSendesFra = format(subDays(new Date(periode1.fraOgMed), 1), "yyyy-MM-dd");

      const periode2 = {
        fraOgMed: formatereDato(subDays(new Date(fraOgMed), 28)),
        tilOgMed: formatereDato(subDays(new Date(fraOgMed), 15)),
      };

      const periode2KanSendesFra = format(subDays(new Date(periode2.fraOgMed), 1), "yyyy-MM-dd");

      const periode3 = {
        fraOgMed: formatereDato(subDays(new Date(fraOgMed), 42)),
        tilOgMed: formatereDato(subDays(new Date(fraOgMed), 29)),
      };

      const periode3KanSendesFra = format(subDays(new Date(periode3.fraOgMed), 1), "yyyy-MM-dd");

      // Endret
      const endretPeriode = lagRapporteringsperiode({
        kanSendes: false,
        status: IRapporteringsperiodeStatus.Endret,
        rapporteringstype: Rapporteringstype.harAktivitet,
        periode: periode1,
        kanEndres: false,
        kanSendesFra: periode1KanSendesFra,
        mottattDato: periode1KanSendesFra,
      });
      db.rapporteringsperioder.create(endretPeriode);

      // Innsendt (erstatter endret)
      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          kanSendes: false,
          rapporteringstype: Rapporteringstype.harAktivitet,
          status: IRapporteringsperiodeStatus.Innsendt,
          periode: periode1,
          kanEndres: false,
          kanSendesFra: periode1KanSendesFra,
          originalId: endretPeriode.id,
          mottattDato: format(addDays(new Date(periode1.fraOgMed), 7), "yyyy-MM-dd"),
          begrunnelseEndring: "Glemt å registrere aktivitet",
        })
      );

      // Ferdig
      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          kanSendes: false,
          bruttoBelop: 8632,
          status: IRapporteringsperiodeStatus.Ferdig,
          rapporteringstype: Rapporteringstype.harAktivitet,
          periode: periode2,
          kanSendesFra: periode2KanSendesFra,
          mottattDato: periode2KanSendesFra,
        })
      );

      // Feilet
      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          kanSendes: false,
          status: IRapporteringsperiodeStatus.Feilet,
          rapporteringstype: Rapporteringstype.harAktivitet,
          periode: periode3,
          kanSendesFra: periode3KanSendesFra,
          mottattDato: periode3KanSendesFra,
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
    deleteAllRapporteringsperioder: () => deleteAllRapporteringsperioder(db),
    updateRapporteringsperioder: (scenario: ScenarioType) =>
      updateRapporteringsperioder(db, scenario),
    clear: () => {
      deleteAllRapporteringsperioder(db);
      deleteAllInnsendteperioder(db);
    },
  };
};
