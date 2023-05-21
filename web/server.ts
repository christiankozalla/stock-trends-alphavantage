import { config } from "https://deno.land/x/dotenv@v3.2.2/mod.ts";
import { createApp, eventHandler, toNodeListener } from "npm:h3";
import { listen } from "npm:listhen";

const PORT = config().SERVER_PORT || Deno.env.get("SERVER_PORT") || "3000";

const app = createApp();
app.use(
  "/",
  eventHandler(() => "Hello world!"),
);

export const startServer = () =>
  listen(toNodeListener(app), {
    port: PORT,
    hostname: "localhost",
    https: false,
  });
