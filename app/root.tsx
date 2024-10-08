/* eslint-disable */
import { getDecoratorHTML } from "./dekorator/dekorator.server";
import { DevTools } from "./devTools";
import { getLanguage, setLanguage } from "./models/language.server";
import { allTextsQuery } from "./sanity/sanity.query";
import type { ISanity } from "./sanity/sanity.types";
import favicon16 from "/favicon-16x16.png";
import favicon32 from "/favicon-32x32.png";
import favicon from "/favicon.ico";
import { Alert, Heading } from "@navikt/ds-react";
import { setAvailableLanguages } from "@navikt/nav-dekoratoren-moduler";
import { onLanguageSelect } from "@navikt/nav-dekoratoren-moduler";
import { json, redirect } from "@remix-run/node";
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
import { hasSession } from "mocks/session";
import { uuidv7 } from "uuidv7";
import { sanityConfig } from "./sanity/sanity.config";
import { DecoratorLocale, availableLanguages, getLocale } from "./utils/dekoratoren.utils";
import { isLocalOrDemo } from "./utils/env.utils";
import { initInstrumentation } from "./utils/faro";
import { useInjectDecoratorScript } from "./hooks/useInjectDecoratorScript";
import { useSanity } from "./hooks/useSanity";
import { useTypedRouteLoaderData } from "./hooks/useTypedRouteLoaderData";
import Center from "./components/center/Center";
import { RootErrorBoundaryView } from "./components/error-boundary/RootErrorBoundaryView";

/* eslint-enable */
import navStyles from "@navikt/ds-css/dist/index.css?url";
import indexStyle from "~/index.css?url";

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
      href: favicon32,
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: favicon16,
    },
    {
      rel: "icon",
      type: "image/x-icon",
      href: favicon,
    },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const locale: DecoratorLocale = (await getLanguage(request)) as DecoratorLocale;
  const fragments = await getDecoratorHTML({ language: locale ?? DecoratorLocale.NB });

  if (!fragments)
    throw json({ error: "rapportering-feilmelding-kunne-ikke-hente-dekoratoren" }, { status: 500 });

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

  return json({
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
  });
}

export async function action({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const formData = await request.formData();

  const locale = formData.get("locale") as DecoratorLocale;

  return json(
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
          <Center>
            <Alert variant="warning">
              Dette er en demoside og inneholder ikke dine personlige data.
            </Alert>
          </Center>
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
  const useLanguageSelector = false;
  if (useLanguageSelector && typeof document !== "undefined") {
    setAvailableLanguages(availableLanguages);

    onLanguageSelect((language) => {
      fetcher.submit({ locale: language.locale }, { method: "post" });
    });
  }

  return (
    <main id="maincontent" role="main" tabIndex={-1}>
      <div className="rapportering-header">
        <div className="rapportering-header-innhold">
          <Heading tabIndex={-1} level="1" size="xlarge" className="vo-fokus">
            {getAppText("rapportering-tittel")}
          </Heading>
          {isLocalOrDemo && <DevTools />}
        </div>
      </div>
      <div className="rapportering-container">
        <Outlet />
      </div>
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return <RootErrorBoundaryView links={<Links />} meta={<Meta />} error={error} />;
}
