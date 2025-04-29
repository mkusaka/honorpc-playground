import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// ◀── すべてのルートを new Hono() にチェーン
export const app = new Hono()
  .get(
    "/posts",
    zValidator("query", z.object({ id: z.string() })),
    (c) => {
      const { id } = c.req.valid("query");
      if (id !== "1") {
        return c.json({ error: "not found" }, 404);
      }
      return c.json({ post: { id, title: "Hello World" } }, 200);
    },
  )
  .get(
    "/validate",
    zValidator("query", z.object({ 
      age: z.number().min(18).max(100),
      email: z.string().email()
    })),
    (c) => {
      const { age, email } = c.req.valid("query");
      return c.json({ age, email }, 200);
    }
  )
  .onError((err, c) => {
    console.log("error deta");
    return c.json({ error: err.message }, 500);
  });

export type AppType = typeof app;

serve({
  fetch: app.fetch,
  port: 8787,
});
