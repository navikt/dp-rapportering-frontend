import parse from "html-react-parser";
import type { DecoratorElements } from "@navikt/nav-dekoratoren-moduler/ssr";

export function hentDekoratorReact(fragments: DecoratorElements) {
  return {
    Styles: () => <>{parse(fragments.DECORATOR_STYLES)}</>,
    Scripts: () => <>{parse(fragments.DECORATOR_SCRIPTS)}</>,
    Header: () => <>{parse(fragments.DECORATOR_HEADER)}</>,
    Footer: () => <>{parse(fragments.DECORATOR_FOOTER)}</>,
  };
}
