import { getDecoratorHTML } from "./dekorator/dekorator.server";
import { DevTools } from "./devTools";
import { getLanguage, setLanguage } from "./models/language.server";
import { allTextsQuery } from "./sanity/sanity.query";
import type { ISanity } from "./sanity/sanity.types";
import styles from "./styles/root.module.css";
import { Alert, Heading } from "@navikt/ds-react";
import { onLanguageSelect, setAvailableLanguages } from "@navikt/nav-dekoratoren-moduler";
import { redirect } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useRouteError,
} from "@remix-run/react";
import { createClient } from "@sanity/client";
import parse from "html-react-parser";
import { uuidv7 } from "uuidv7";
import { sanityConfig } from "./sanity/sanity.config";
import { DecoratorLocale, availableLanguages, getLocale } from "./utils/dekoratoren.utils";
import { getEnv, isLocalOrDemo } from "./utils/env.utils";
import { initInstrumentation } from "./utils/faro";
import { useInjectDecoratorScript } from "./hooks/useInjectDecoratorScript";
import { useSanity } from "./hooks/useSanity";
import { useTypedRouteLoaderData } from "./hooks/useTypedRouteLoaderData";
import { GeneralErrorBoundary } from "./components/error-boundary/GeneralErrorBoundary";
import { ServiceMessage } from "./components/service-message/ServiceMessage";
import navStyles from "@navikt/ds-css/dist/index.css?url";
import indexStyle from "~/index.css?url";
import { hasSession } from "../mocks/session";

export const sanityClient = createClient(sanityConfig);

export const meta: MetaFunction = () => {
  return [
    {
      charset: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width,initial-scale=1",
    },
    { title: "Meldekort - dagpenger" },
    {
      property: "og:title",
      content: "Meldekort - dagpenger",
    },
    {
      name: "description",
      content: "meldekortløsning for dagpenger",
    },
  ];
};

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: navStyles },
    { rel: "stylesheet", href: indexStyle },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: `${getEnv("BASE_PATH")}/favicon-32x32.png`,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: `${getEnv("BASE_PATH")}/favicon-16x16.png`,
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: `${getEnv("BASE_PATH")}/favicon.ico`,
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: DecoratorLocale = (await getLanguage(request)) as DecoratorLocale;
  const fragments = await getDecoratorHTML({ language: locale ?? DecoratorLocale.NB });

  if (!fragments) {
    throw new Response("rapportering-feilmelding-kunne-ikke-hente-dekoratoren", { status: 500 });
  }

  const sanityTexts = await sanityClient.fetch<ISanity>(allTextsQuery, {
    baseLang: DecoratorLocale.NB,
    lang: getLocale(locale),
  });

  if (isLocalOrDemo && !hasSession(request)) {
    return redirect("/", {
      headers: {
        "Set-Cookie": `sessionId=${uuidv7()}`,
      },
    });
  }

  return {
    sanityTexts,
    locale: getLocale(locale),
    env: {
      BASE_PATH: process.env.BASE_PATH,
      IS_LOCALHOST: process.env.IS_LOCALHOST,
      USE_MSW: process.env.USE_MSW,
      FARO_URL: process.env.FARO_URL,
      RUNTIME_ENVIRONMENT: process.env.RUNTIME_ENVIRONMENT,
      SANITY_DATASETT: process.env.SANITY_DATASETT,
      GITHUB_SHA: process.env.GITHUB_SHA,
    },
    fragments,
  };
}

export async function action({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const formData = await request.formData();

  const locale = formData.get("locale") as DecoratorLocale;

  return Response.json(
    { status: "success" },
    {
      headers: {
        "Set-Cookie": await setLanguage(cookieHeader, locale),
      },
    }
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { fragments, env } = useTypedRouteLoaderData("root");
  const { getMessages } = useSanity();

  const serviceMessages = getMessages();

  useInjectDecoratorScript(fragments.DECORATOR_SCRIPTS);

  return (
    <html lang="nb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {parse(fragments.DECORATOR_HEAD_ASSETS, { trim: true })}
        <Meta />
        <Links />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        {parse(fragments.DECORATOR_HEADER, { trim: true })}

        {isLocalOrDemo && (
          <div className={styles.serviceMessages}>
            <Alert variant="warning">
              Dette er en demoside og inneholder ikke dine personlige data.
            </Alert>
          </div>
        )}

        {serviceMessages.length > 0 && (
          <div className={styles.serviceMessages}>
            {serviceMessages.map((message) => (
              <ServiceMessage key={message.textId} message={message} />
            ))}
          </div>
        )}

        {children}
        <ScrollRestoration />
        {parse(fragments.DECORATOR_FOOTER, { trim: true })}
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { getAppText } = useSanity();

  initInstrumentation();

  const fetcher = useFetcher();
  if (typeof document !== "undefined") {
    setAvailableLanguages(availableLanguages);

    onLanguageSelect((language) => {
      // TODO: Logg endring av språk til amplitude
      document.documentElement.setAttribute("lang", language.locale);
      fetcher.submit({ locale: language.locale }, { method: "post" });
    });
  }

  return (
    <main id="maincontent" role="main" tabIndex={-1}>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
            {getAppText("rapportering-tittel")}
          </Heading>
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>
      <div className={styles.rapporteringContainer}>
        <Outlet />
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const { getAppText } = useSanity();

  return (
    <main id="maincontent" role="main" tabIndex={-1}>
      <div className={styles.rapporteringHeader}>
        <div className={styles.rapporteringHeaderInnhold}>
          <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
            {getAppText("rapportering-tittel")}
          </Heading>
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>
      <div className={styles.rapporteringContainer}>
        <GeneralErrorBoundary error={error} />
      </div>
    </main>
  );
}
