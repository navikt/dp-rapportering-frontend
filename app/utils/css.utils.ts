import styles from "~/routes/rapportering.module.css";

export function visGraaBakgrunn(periodeStatus: string) {
  if (periodeStatus === "TilUtfylling") {
    return "";
  }
  return styles.graaBakgrunn;
}
