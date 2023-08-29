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
  function finnRedigeringsType(status: string): IRedigeringsLenke {
    switch (status) {
      case "TilUtfylling":
        return { sti: "fyll-ut", tekst: "Fyll ut" };
      case "Godkjent":
        return { sti: "avgodkjenn", tekst: "Korriger" };
      case "Innsendt":
        return { sti: "korriger", tekst: "Korriger" };
      default:
        console.log("Traff ukjent status i kalenderlenke: ", status);
        return { sti: "", tekst: "Ukjent" };
    }
  }

  const redigeringsType = finnRedigeringsType(props.status);

  return (
    <RemixLink as="Link" to={`/rapportering/periode/${props.id}/${redigeringsType.sti}`}>
      {redigeringsType.tekst}
    </RemixLink>
  );
}
