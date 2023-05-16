import type { LoaderArgs } from "@remix-run/node";
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
import { hentDekoratorReact } from "./dekorator/dekorator";

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
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: `${getEnv("BASE_PATH")}/apple-touch-icon.png`,
          },
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
          { rel: "manifest", href: `${getEnv("BASE_PATH")}/site.webmanifest.json` },
          {
            rel: "mask-icon",
            href: `${getEnv("BASE_PATH")}/safari-pinned-tab.svg`,
            color: "#5bbad5",
          },
        ]
      : []),
  ];
}

export async function loader({ request }: LoaderArgs) {
  const fragments = await hentDekoratorHtml();

  return {
    env: {},
    fragments,
  };
}

export default function App() {
  const { env, fragments } = useLoaderData<typeof loader>();
  const Decorator = hentDekoratorReact(fragments);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Decorator.Styles />
        <Links />
      </head>
      <body>
        <Decorator.Header />
        <Outlet />
        <ScrollRestoration />
        <Decorator.Footer />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <Scripts />
        <Decorator.Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return <RootErrorBoundaryView links={<Links />} meta={<Meta />} error={error} />;
}
