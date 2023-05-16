export const periodeMock = {
  id: 0,
  startDato: "2023-05-01", //endret fra engelsk til norsk key
  sluttDato: "2023-05-14", // endret fra engelsk til norsk key
  status: "string", //For å se om blant annet perioden er "låst" eller ikke?
  dager: [
    {
      dagIndex: 0,
      dato: "2023-05-01", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [
        {
          id: 123,
          type: "Arbeid",
          hours: 7.5,
        },
      ],
    },
    {
      dagIndex: 1,
      dato: "2023-05-02", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [
        {
          id: 124,
          type: "Arbeid",
          hours: 7.5,
        },
      ],
    },
    {
      dagIndex: 2,
      dato: "2023-05-03", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [
        {
          id: 125,
          type: "Arbeid",
          hours: 4,
        },
      ],
    },
    {
      dagIndex: 3,
      dato: "2023-05-04", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 4,
      dato: "2023-05-05", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 5,
      dato: "2023-05-06", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 6,
      dato: "2023-05-07", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 7,
      dato: "2023-05-08", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 8,
      dato: "2023-05-09", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 9,
      dato: "2023-05-10", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 10,
      dato: "2023-05-11", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 11,
      dato: "2023-05-12", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 12,
      dato: "2023-05-13", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
    {
      dagIndex: 13,
      dato: "2023-05-14", // kun for visningens skyld, det er farlig å generere datoer i frontend pga. tidssoner
      aktiviteter: [],
    },
  ],
};
