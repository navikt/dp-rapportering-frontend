import { LoaderArgs, json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import navStyles from "@navikt/ds-css/dist/index.css";
import { cssBundleHref } from "@remix-run/css-bundle";
import { getEnv } from "./utils/env.utils";
import { RootErrorBoundaryView } from "./components/error-boundary/RootErrorBoundaryView";
import { hentDekoratorHtml } from "./dekorator/dekorator.server";
import parse from "html-react-parser";

import indexStyle from "~/index.css";

export function meta() {
  return [
    {
      charset: "utf-8",
      title: "Dagpenger rapportering",
      viewport: "width=device-width,initial-scale=1",
      description: "rapporteringløsning for dagpenger",
    },
  ];
}

export function links() {
  return [
    ...(cssBundleHref
      ? [
          { rel: "stylesheet", href: navStyles },
          { rel: "stylesheet", href: cssBundleHref },
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
        ]
      : []),
  ];
}

export async function loader({ request }: LoaderArgs) {
  const fragments = await hentDekoratorHtml();

  return json({
    env: {
      BASE_PATH: process.env.BASE_PATH,
      DP_RAPPORTERING_URL: process.env.DP_RAPPORTERING_URL,
    },
    fragments,
  });
}

export default function App() {
  const { env, fragments } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        {parse(fragments.DECORATOR_STYLES, { trim: true })}
        {/* Ikke legg parsing av dekoratør-html i egne komponenter. Det trigger rehydrering, 
            som gjør at grensesnittet flimrer og alle assets lastes på nytt siden de har så mange side effects. 
            Løsningen enn så lenge er å inline parsingen av HTML her i root. 
         */}
        <Links />
      </head>
      <body>
        {parse(fragments.DECORATOR_HEADER, { trim: true })}
        <Outlet />
        <ScrollRestoration />
        {parse(fragments.DECORATOR_FOOTER, { trim: true })}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <Scripts />
        {parse(fragments.DECORATOR_SCRIPTS, { trim: true })}
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return <RootErrorBoundaryView links={<Links />} meta={<Meta />} error={error} />;
}
