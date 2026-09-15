import {
  DecoratorElements,
  DecoratorEnvProps,
  type DecoratorFetchProps,
  type DecoratorParams,
  fetchDecoratorHtml,
} from "@navikt/nav-dekoratoren-moduler/ssr";

import { logger } from "~/models/logger.server";
import { DecoratorLocale } from "~/utils/dekoratoren.utils";
import { getEnv } from "~/utils/env.utils";

export async function getDecoratorHTML(
  params: DecoratorParams,
): Promise<DecoratorElements | undefined> {
  const config: DecoratorFetchProps = {
    env: (getEnv("DEKORATOR_ENV") || "localhost") as DecoratorEnvProps["env"],
    localUrl: "https://dekoratoren.ekstern.dev.nav.no",
    params: {
      language: DecoratorLocale.NB,
      context: "privatperson",
      chatbot: false,
      redirectToApp: true,
      level: "Level4",
      breadcrumbs: [],
      ...params,
    },
  };

  try {
    return await fetchDecoratorHtml(config);
  } catch (error: unknown) {
    logger.error("Kunne ikke hente dekoratøren", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return undefined;
  }
}
