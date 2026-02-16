import { addDays, format, getWeek, getYear, subDays } from "date-fns";

import { ScenarioType } from "~/devTools";
import { beregnNåværendePeriodeDato, lagPeriodeDatoFor } from "~/devTools/periodedato";
import {
  lagForstRapporteringsperiode,
  lagRapporteringsperiode,
  leggTilForrigeRapporteringsperiode,
} from "~/devTools/rapporteringsperiode";
import {
  IRapporteringsperiode,
  IRapporteringsperiodeDag,
} from "~/models/rapporteringsperiode.server";
import { formaterDato } from "~/utils/dato.utils";
import { isLocalOrDemo } from "~/utils/env.utils";
import { IRapporteringsperiodeStatus, KortType, Rapporteringstype } from "~/utils/types";

import { Database } from "../session";

async function seedRapporteringsperioder(db: Database) {
  await db.rapporteringsperioder.create(lagForstRapporteringsperiode());
}

async function addRapporteringsperioder(db: Database, rapporteringsperiode: IRapporteringsperiode) {
  await db.rapporteringsperioder.create(rapporteringsperiode);
}

function findAllRapporteringsperioder(db: Database) {
  return db.rapporteringsperioder.findMany((q) => q.where({ status: "TilUtfylling" }), {
    orderBy: {
      periode: {
        fraOgMed: "asc",
      },
    },
  }) as IRapporteringsperiode[];
}

function findAllInnsendtePerioder(db: Database) {
  return db.rapporteringsperioder.findMany(
    (q) =>
      q
        .where({ status: "Innsendt" })
        .or({ status: "Endret" })
        .or({ status: "Ferdig" })
        .or({ status: "Feilet" }),
    {
      orderBy: {
        mottattDato: "desc",
        originalId: "asc",
      },
    },
  ) as IRapporteringsperiode[];
}

function findRapporteringsperiodeById(db: Database, id: string) {
  return db.rapporteringsperioder.findFirst((q) => q.where({ id: id })) as IRapporteringsperiode;
}

async function updateRapporteringsperiode(
  db: Database,
  id: string,
  oppdatertPeriode: Partial<IRapporteringsperiode>,
) {
  return await db.rapporteringsperioder.update((q) => q.where({ id: id }), {
    data(periode) {
      if (oppdatertPeriode.type != undefined) periode.type = oppdatertPeriode.type;
      if (oppdatertPeriode.periode != undefined) periode.periode = oppdatertPeriode.periode;
      if (oppdatertPeriode.dager != undefined) periode.dager = oppdatertPeriode.dager;
      if (oppdatertPeriode.sisteFristForTrekk != undefined)
        periode.sisteFristForTrekk = oppdatertPeriode.sisteFristForTrekk;
      if (oppdatertPeriode.kanSendesFra != undefined)
        periode.kanSendesFra = oppdatertPeriode.kanSendesFra;
      if (oppdatertPeriode.kanSendes != undefined) periode.kanSendes = oppdatertPeriode.kanSendes;
      if (oppdatertPeriode.kanEndres != undefined) periode.kanEndres = oppdatertPeriode.kanEndres;
      if (oppdatertPeriode.bruttoBelop != undefined)
        periode.bruttoBelop = oppdatertPeriode.bruttoBelop;
      if (oppdatertPeriode.begrunnelseEndring != undefined)
        periode.begrunnelseEndring = oppdatertPeriode.begrunnelseEndring;
      if (oppdatertPeriode.status != undefined) periode.status = oppdatertPeriode.status;
      if (oppdatertPeriode.mottattDato != undefined)
        periode.mottattDato = oppdatertPeriode.mottattDato;
      if (oppdatertPeriode.registrertArbeidssoker != undefined)
        periode.registrertArbeidssoker = oppdatertPeriode.registrertArbeidssoker;
      if (oppdatertPeriode.originalId != undefined)
        periode.originalId = oppdatertPeriode.originalId;
      if (oppdatertPeriode.html != undefined) periode.html = oppdatertPeriode.html;
      if (oppdatertPeriode.rapporteringstype != undefined)
        periode.rapporteringstype = oppdatertPeriode.rapporteringstype;
    },
  });
}

async function lagreAktivitet(
  db: Database,
  rapporteringsperiodeId: string,
  dag: IRapporteringsperiodeDag,
) {
  const periode = findRapporteringsperiodeById(db, rapporteringsperiodeId);

  if (periode) {
    const oppdatertDager = periode.dager.map((d) => {
      if (d.dato === dag.dato) {
        return dag;
      }
      return d;
    });

    await db.rapporteringsperioder.update((q) => q.where({ id: rapporteringsperiodeId }), {
      data(periode) {
        periode.dager = oppdatertDager;
      },
    });
  }
}

async function deleteAllAktiviteter(db: Database, rapporteringsperiodeId: string) {
  const periode = findRapporteringsperiodeById(db, rapporteringsperiodeId);

  if (periode) {
    const oppdatertDager = periode.dager.map((d) => {
      return { ...d, aktiviteter: [] };
    });

    await db.rapporteringsperioder.update((q) => q.where({ id: rapporteringsperiodeId }), {
      data(periode) {
        periode.dager = oppdatertDager;
      },
    });
  }
}

function deleteAllRapporteringsperioder(db: Database) {
  const perioder = db.rapporteringsperioder.findMany() as IRapporteringsperiode[];

  perioder.forEach((periode) => {
    db.rapporteringsperioder.delete((q) => q.where({ id: periode.id }));
  });
}

const deleteAllInnsendteperioder = (db: Database) => {
  const innsendteperioder = findAllInnsendtePerioder(db);

  innsendteperioder.forEach((periode) => {
    db.rapporteringsperioder.delete((q) => q.where({ id: periode.id }));
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
        }),
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
        leggTilForrigeRapporteringsperiode(findAllRapporteringsperioder(db)[0].periode),
      );
      break;
    }

    case ScenarioType.innsendte: {
      deleteAllRapporteringsperioder(db);

      const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

      const periode1 = {
        fraOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 14), dateFormat: "yyyy-MM-dd" }),
        tilOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 1), dateFormat: "yyyy-MM-dd" }),
      };

      const periode1KanSendesFra = formaterDato({
        dato: subDays(new Date(periode1.fraOgMed), 1),
        dateFormat: "yyyy-MM-dd",
      });

      const periode2 = {
        fraOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 28), dateFormat: "yyyy-MM-dd" }),
        tilOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 15), dateFormat: "yyyy-MM-dd" }),
      };

      const periode2KanSendesFra = formaterDato({
        dato: subDays(new Date(periode2.fraOgMed), 1),
        dateFormat: "yyyy-MM-dd",
      });

      const periode3 = {
        fraOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 42), dateFormat: "yyyy-MM-dd" }),
        tilOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 29), dateFormat: "yyyy-MM-dd" }),
      };

      const periode3KanSendesFra = formaterDato({
        dato: subDays(new Date(periode3.fraOgMed), 1),
        dateFormat: "yyyy-MM-dd",
      });

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
        }),
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
        }),
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
        }),
      );

      db.rapporteringsperioder.create(
        lagRapporteringsperiode({
          periode: {
            fraOgMed,
            tilOgMed,
          },
        }),
      );
      break;
    }

    case ScenarioType.manuelt: {
      deleteAllRapporteringsperioder(db);

      const { fraOgMed } = beregnNåværendePeriodeDato();

      const periode = {
        fraOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 28), dateFormat: "yyyy-MM-dd" }),
        tilOgMed: formaterDato({ dato: subDays(new Date(fraOgMed), 15), dateFormat: "yyyy-MM-dd" }),
      };

      const periodeKanSendesFra = formaterDato({
        dato: subDays(new Date(periode.fraOgMed), 1),
        dateFormat: "yyyy-MM-dd",
      });

      const endretPeriode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        periode,
        kanSendesFra: periodeKanSendesFra,
        mottattDato: periodeKanSendesFra,
      });
      db.rapporteringsperioder.create(endretPeriode);
      break;
    }

    case ScenarioType.etterregistrert: {
      deleteAllRapporteringsperioder(db);

      const { fraOgMed, tilOgMed } = beregnNåværendePeriodeDato();

      const etterregistrertPeriode = lagRapporteringsperiode({
        type: KortType.ETTERREGISTRERT,
        periode: {
          fraOgMed,
          tilOgMed,
        },
      });

      db.rapporteringsperioder.create(etterregistrertPeriode);
      break;
    }

    case ScenarioType.bokmerket: {
      deleteAllRapporteringsperioder(db);

      const { fraOgMed } = beregnNåværendePeriodeDato();

      // Opprett et innsendt meldekort fra forrige periode (simulerer et gammelt, allerede innsendt meldekort)
      const forrigePeriodeFra = formaterDato({
        dato: subDays(new Date(fraOgMed), 14),
        dateFormat: "yyyy-MM-dd",
      });
      const forrigePeriodeTil = formaterDato({
        dato: subDays(new Date(fraOgMed), 1),
        dateFormat: "yyyy-MM-dd",
      });

      const innsendt = lagRapporteringsperiode({
        kanSendes: false,
        status: IRapporteringsperiodeStatus.Innsendt,
        rapporteringstype: Rapporteringstype.harAktivitet,
        periode: {
          fraOgMed: forrigePeriodeFra,
          tilOgMed: forrigePeriodeTil,
        },
        kanEndres: true,
        kanSendesFra: formaterDato({
          dato: subDays(new Date(forrigePeriodeFra), 1),
          dateFormat: "yyyy-MM-dd",
        }),
        mottattDato: formaterDato({
          dato: addDays(new Date(forrigePeriodeFra), 7),
          dateFormat: "yyyy-MM-dd",
        }),
      });
      db.rapporteringsperioder.create(innsendt);

      // Opprett et innsendt meldekort som ikke kan endres (simulerer prod-casen med kanEndres=false)
      const forrigeforrigePeriodeFra = formaterDato({
        dato: subDays(new Date(fraOgMed), 28),
        dateFormat: "yyyy-MM-dd",
      });
      const forrigeforrigePeriodeTil = formaterDato({
        dato: subDays(new Date(fraOgMed), 15),
        dateFormat: "yyyy-MM-dd",
      });

      const ikkeKanEndres = lagRapporteringsperiode({
        kanSendes: false,
        status: IRapporteringsperiodeStatus.Innsendt,
        rapporteringstype: Rapporteringstype.harAktivitet,
        periode: {
          fraOgMed: forrigeforrigePeriodeFra,
          tilOgMed: forrigeforrigePeriodeTil,
        },
        kanEndres: false,
        kanSendesFra: formaterDato({
          dato: subDays(new Date(forrigeforrigePeriodeFra), 1),
          dateFormat: "yyyy-MM-dd",
        }),
        mottattDato: formaterDato({
          dato: addDays(new Date(forrigeforrigePeriodeFra), 7),
          dateFormat: "yyyy-MM-dd",
        }),
        begrunnelseEndring: "Annet",
        originalId: "123456789",
      });
      db.rapporteringsperioder.create(ikkeKanEndres);

      // Opprett også ett meldekort som kan fylles ut (slik at forsiden viser noe)
      db.rapporteringsperioder.create(lagForstRapporteringsperiode());

      // Logg ID-ene slik at det er enkelt å teste (kun i local/demo)
      if (isLocalOrDemo) {
        console.log(
          `\n🔖 Bokmerket meldekort scenario:\n` +
            `   1. Innsendt periode (kanEndres=true) ID: ${innsendt.id}\n` +
            `      Test: /periode/${innsendt.id}/fyll-ut\n` +
            `      Forventet: Redirectes til forsiden (status er Innsendt)\n` +
            `   2. Innsendt periode (kanEndres=false) ID: ${ikkeKanEndres.id}\n` +
            `      Test: /periode/${ikkeKanEndres.id}/endring/send-inn\n` +
            `      Forventet: Redirectes til forsiden (kanEndres er false)\n`,
        );
      }

      break;
    }
  }
}

function deleteRapporteringsperiode(db: Database, id: string) {
  db.rapporteringsperioder.delete((q) => q.where({ id: id }));
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
    deleteAllAktiviteter: (rapporteringsperiodeId: string) =>
      deleteAllAktiviteter(db, rapporteringsperiodeId),
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
