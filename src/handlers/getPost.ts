// src/handlers/getPost.ts
import { AppError, fail, NotFoundError, ok, Result } from "../lib/result";

export interface Post {
  id: string;
  title: string;
}

export async function getPost(id: string): Promise<Result<{ post: Post }, NotFoundError>> {
  if (id !== "1") {
    return fail(new NotFoundError());
  };
  return ok({ post: { id, title: "Hello World" } });
}
