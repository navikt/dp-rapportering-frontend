import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "../RemixLink";

interface IProps {
  id: string;
  status: string;
}

export function KorrigeringsLenke(props: IProps) {
  const { getAppText } = useSanity();

  const korrigeringsType = {
    sti: "korriger",
    tekst: getAppText("rapportering-redigeringslenke-korriger"),
  };

  return (
    <RemixLink as="Link" to={`/periode/${props.id}/${korrigeringsType.sti}`}>
      {korrigeringsType.tekst}
    </RemixLink>
  );
}
