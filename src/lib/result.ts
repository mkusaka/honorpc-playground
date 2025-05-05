// src/lib/result.ts
export abstract class AppError extends Error {
  abstract status: number;
}

// 具体的なエラー
export class NotFoundError extends AppError {
  status = 404 as const;
  constructor(msg = "not found") {
    super(msg);
  }
}
export class ValidationError extends AppError {
  status = 400 as const;
  constructor(msg = "validation error") {
    super(msg);
  }
}
// …今後追加するエラーもここに列挙

// Result<T, E>
export type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const fail = <E extends AppError>(error: E): Result<never, E> => ({
  ok: false,
  error,
});
