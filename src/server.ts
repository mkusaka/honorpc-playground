// src/server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { logger } from "hono/logger";
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import "zod-openapi/extend";
import { getPost } from "./handlers/getPost";

// ── schema definition ────────────────────────────────────────────

const PostsQuerySchema = z
  .object({ id: z.string().openapi({ example: "1" }) })
  .openapi("PostsQuery" );

const PostResponseSchema = z
  .object({
    post: z.object({
      id: z.string().openapi({ example: "1" }),
      title: z.string().openapi({ example: "Hello World" }),
    }),
  })
  .openapi("PostResponse");

const ErrorResponseSchema = z
  .object({ error: z.string().openapi({ example: "not found" }) })
  .openapi("ErrorResponse");

// validation schema for Zod (not for OpenAPI)
const ValidateQuerySchema = z.object({
  age: z.number().min(18).max(100),
  email: z.string().email(),
});

// -- route definition ────────────────────────────────────────────

const postsRoutes = createRoute({
  method: "get",
  path: "/posts",
  request: {
    query: PostsQuerySchema,
  },
  middleware: [zValidator("query", PostsQuerySchema)],
  responses: {
    200: {
      description: "Post found",
      content: {
        "application/json": {
          schema: PostResponseSchema,
        },
      },
    },
    404: {
      description: "Not Found",
      content: {
        "application/json": { schema: ErrorResponseSchema },
      },
    },
    500: {
      description: "Server Error",
      content: {
        "application/json": { schema: ErrorResponseSchema },
      },
    },
  },
});

export const app2 = new OpenAPIHono()
  .openapi(postsRoutes, async (c) => {
    const { id } = c.req.valid("query");
    const result = await getPost(id);
    if (!result.ok) {
      return c.json(result.error, 404);
    }
    return c.json(result.value, 200);
  });

app2.use("*", logger());

export type AppType2 = typeof app2;

// ── app initialization & route registration (chain式)──────────────────────

export const app = new Hono()
  // log middleware
  .use("*", logger())

  // ■ GET /posts?id={id}
  .get(
    "/posts",
    describeRoute({
      description: "Get a post by ID",
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          schema: resolver(z.string().openapi({ example: "1" })),
        },
      ],
      responses: {
        200: {
          description: "Post found",
          content: {
            "application/json": { schema: resolver(PostResponseSchema) },
          },
        },
        404: {
          description: "Not Found",
          content: {
            "application/json": { schema: resolver(ErrorResponseSchema) },
          },
        },
        500: {
          description: "Not Found",
          content: {
            "application/json": { schema: resolver(ErrorResponseSchema) },
          },
        },
      },
    }),
    zValidator("query", PostsQuerySchema),
    (c) => {
      const { id } = c.req.valid("query");
      if (id !== "1") {
        return c.json({ error: "not found" }, 404);
      }
      return c.json({ post: { id, title: "Hello World" } }, 200);
    },
  )

  // ■ GET /validate?age={age}&email={email}
  .get(
    "/validate",
    describeRoute({
      description: "Validate age and email",
      parameters: [
        {
          name: "age",
          in: "query",
          required: true,
          schema: resolver(
            z.number().min(18).max(100).openapi({ example: 25 }),
          ),
        },
        {
          name: "email",
          in: "query",
          required: true,
          schema: resolver(
            z.string().email().openapi({ example: "foo@example.com" }),
          ),
        },
      ],
      responses: {
        200: {
          description: "Valid data",
          content: {
            "application/json": {
              schema: resolver(
                z
                  .object({ age: z.number(), email: z.string() })
                  .openapi({ ref: "ValidateResponse" }),
              ),
            },
          },
        },
        500: {
          description: "Validation or server error",
          content: {
            "application/json": { schema: resolver(ErrorResponseSchema) },
          },
        },
      },
    }),
    zValidator("query", ValidateQuerySchema),
    (c) => {
      const { age, email } = c.req.valid("query");
      return c.json({ age, email }, 200);
    },
  );

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "HonorPC Playground API",
        version: "1.0.0",
        description: "Hono + Zod Playground with OpenAPI",
      },
      servers: [{ url: "http://localhost:8787", description: "Local" }],
    },
  }),
);

// ■ client type export & server start ─────────────────────

export type AppType = typeof app;

serve({ fetch: app.fetch, port: 8787 });
