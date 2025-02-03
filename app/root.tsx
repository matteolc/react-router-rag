import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LoaderFunctionArgs,
} from "react-router";
import { getClientLocales } from "remix-utils/locales/server";
import type { Route } from "./+types/root";
import { getHints } from "./hooks/use-hints";
import { getDomainUrl } from "./lib/get-domain-url";
import { getTheme, useTheme } from "./hooks/use-theme";
import "./globals.css";

export function meta() {
  return [
    { title: "RAG Application" },
    { name: "description", content: "Retrieval Augmented Generation App" },
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const locales = getClientLocales(request);
  return new Response(
    JSON.stringify({
      requestInfo: {
        hints: getHints(request),
        origin: getDomainUrl(request),
        path: new URL(request.url).pathname,
        userPrefs: { theme: getTheme(request) },
      },
      locales,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <html lang="en" data-theme={theme} className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
