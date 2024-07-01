import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "../RemixLink";

interface IProps {
  id: string;
  status: string;
}

interface IRedigeringsLenke {
  sti: string;
  tekst: string;
}

export function RedigeringsLenke(props: IProps) {
  const { getAppText } = useSanity();

  function finnRedigeringsType(status: string): IRedigeringsLenke {
    switch (status) {
      case "TilUtfylling":
        "Korrigert";
        return { sti: "fyll-ut", tekst: getAppText("rapportering-redigeringslenke-fyll-ut") };
      case "Godkjent":
        return { sti: "avgodkjenn", tekst: getAppText("rapportering-redigeringslenke-korriger") };
      case "Innsendt":
        return { sti: "korriger", tekst: getAppText("rapportering-redigeringslenke-korriger") };
      default:
        console.log("Traff ukjent status i kalenderlenke: ", status);
        return { sti: "", tekst: getAppText("rapportering-redigeringslenke-ukjent") };
    }
  }

  const redigeringsType = finnRedigeringsType(props.status);

  return (
    <RemixLink as="Link" to={`/periode/${props.id}/${redigeringsType.sti}`}>
      {redigeringsType.tekst}
    </RemixLink>
  );
}
