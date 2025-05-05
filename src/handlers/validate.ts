// src/handlers/validate.ts
import { ok, Result } from "../lib/result";

export async function validate(
  age: number,
  email: string,
): Promise<Result<{ age: number; email: string }>> {
  // ここではバリデーションを Zod ではなくドメインで行ったと仮定
  return ok({ age, email });
}
