import type { DecoratorFetchProps } from "@navikt/nav-dekoratoren-moduler/ssr";
import { fetchDecoratorHtml } from "@navikt/nav-dekoratoren-moduler/ssr";

export async function hentDekoratorHtml() {
  const env = "dev";

  const config: DecoratorFetchProps = {
    env: env ?? "prod",
    params: {
      language: "nb",
      context: "privatperson",
      chatbot: false,
      simple: true,
      enforceLogin: false,
      redirectToApp: true,
      level: "Level4",
    },
  };

  return await fetchDecoratorHtml(config);
}
