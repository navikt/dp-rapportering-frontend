import { useSanity } from "~/hooks/useSanity";
import { RemixLink } from "../RemixLink";

interface IProps {
  id: string;
  status: string;
}

export function EndringsLenke(props: IProps) {
  const { getAppText } = useSanity();

  const endringsType = {
    sti: "endre",
    tekst: getAppText("rapportering-redigeringslenke-endre"),
  };

  return (
    <RemixLink as="Link" to={`/periode/${props.id}/${endringsType.sti}`}>
      {endringsType.tekst}
    </RemixLink>
  );
}
