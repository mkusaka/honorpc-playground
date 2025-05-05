class ValidationError extends Error {}
class NotFoundError extends Error {}

type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

// エラーを返すヘルパー
function fail<E extends Error>(error: E): Result<never, E> {
  return { ok: false, error };
}

// 正常値を返すヘルパー
function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export async function getPost(
  id: string,
): Promise<Result<{ post: any }, Error>> {
  // ─────────── ここでスタックトレースがキャプチャされる ───────────
  const f = new ValidationError("不正な入力です");
  const foo = fail(f);
  return foo;
  // ────────────────────────────────────────────────────────────────

  if (id !== "1") return fail(new NotFoundError("見つかりません"));
  return ok({ post: { id, title: "Hello World" } });
}

// 実行してみる
(async () => {
  const result = await getPost("oops");
  if (!result.ok) {
    console.error(result.error.stack);
  }
})();
