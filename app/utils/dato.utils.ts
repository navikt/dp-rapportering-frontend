export function hentDatoFraDatoString(dato: string) {
  return dato.split("-")[2].replace(/^0+/, "");
}

export function hentUkedagTekstMedDatoIndex(index: number) {
  switch (index) {
    case 0:
    case 7:
      return "Mandag";
    case 1:
    case 8:
      return "Tirsdag";
    case 2:
    case 9:
      return "Onsdag";
    case 3:
    case 10:
      return "Torsdag";
    case 4:
    case 11:
      return "Fredag";
    case 5:
    case 12:
      return "Lørdag";
    case 6:
    case 13:
      return "Søndag";
  }
}
