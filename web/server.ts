import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";

const PORT = Number(config().SERVER_PORT) ||
  Number(Deno.env.get("SERVER_PORT")) || 3000;
const HOSTNAME = "localhost";
const baseURL = `http://${HOSTNAME}:${PORT}`;

interface Route {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  handler: (req: RequestWithContext) => Response | Promise<Response>;
}

interface RoutePattern extends Route {
  pattern: URLPattern;
}

interface RequestWithContext extends Request {
  params: Record<string, string | undefined>;
  search: URLSearchParams | Record<string, never>;
}

function createRootHandler(routes: Route[]) {
  const routePatterns: RoutePattern[] = routes.map((route) => ({
    ...route,
    pattern: new URLPattern({ pathname: route.path, baseURL, search: "*" }),
  }));
  return (req: Request) => {
    let route: RoutePattern | undefined;
    let match: URLPatternResult | undefined | null;

    for (let i = 0; i < routePatterns.length; i++) {
      if (
        routePatterns[i].pattern.test(req.url)
      ) {
        route = routePatterns[i];
        match = routePatterns[i].pattern.exec(req.url);
        break;
      }
    }

    if (route) {
      const params = match?.pathname.groups || {};
      const search = match?.search.input
        ? new URLSearchParams(match.search.input)
        : {};
      const requestWithContext: RequestWithContext = Object.assign(req, {
        params,
        search,
      });
      return route.handler(requestWithContext);
    }
    return new Response("Not found", {
      status: 404,
    });
  };
}

const routes: Route[] = [
  {
    method: "GET",
    path: "/",
    handler: (req: RequestWithContext) => {
      return new Response("Hello you!" + JSON.stringify(req, null, 2));
    },
  },
  {
    method: "GET",
    path: "/hello/:name/you/:look?",
    handler: (req: RequestWithContext) => {
      const name = req.params.name;
      const look = req.params.look;
      const capizalizedName = name &&
        name[0].toUpperCase() + name.slice(1, name.length);

      return new Response(
        `Hello ${capizalizedName}, you look ${look || "wonderful"}!`,
      );
    },
  },
];

export const startServer = () =>
  serve(
    createRootHandler(routes),
    {
      port: PORT,
      hostname: HOSTNAME,
    },
  );
