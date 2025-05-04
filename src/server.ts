// src/server.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { describeRoute, openAPISpecs } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { logger } from "hono/logger";
import "zod-openapi/extend";
import { z } from "zod";

// ── schema definition ────────────────────────────────────────────

const PostsQuerySchema = z
  .object({ id: z.string().openapi({ example: "1" }) })
  .openapi({ ref: "PostsQuery" });

const PostResponseSchema = z
  .object({
    post: z.object({
      id: z.string().openapi({ example: "1" }),
      title: z.string().openapi({ example: "Hello World" }),
    }),
  })
  .openapi({ ref: "PostResponse" });

const ErrorResponseSchema = z
  .object({ error: z.string().openapi({ example: "not found" }) })
  .openapi({ ref: "ErrorResponse" });

// validation schema for Zod (not for OpenAPI)
const ValidateQuerySchema = z.object({
  age: z.number().min(18).max(100),
  email: z.string().email(),
});

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
