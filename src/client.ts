// src/client.ts
import type { AppType } from "./server";
import { hc } from "hono/client";

async function main() {
  const client = hc<AppType>("http://localhost:8787");

  // 存在しないID → 404
  const res404 = await client.posts.$get({ query: { id: "2" } });
  console.log(res404.status, res404.ok);

  if (!res404.ok) {
    // --- err を必ずキャストして unknown を回避 ---
    const errBody = (await res404.json()) as { error: string };
    console.error("Error:", errBody.error);
  }

  // 正常系
  const res200 = await client.posts.$get({ query: { id: "1" } });
  if (res200.ok) {
    const { post } = (await res200.json()) as {
      post: { id: string; title: string };
    };
    console.log("Success:", post);
  }

  // Zod validation エラーテスト
  console.log("\nTesting Zod validation errors:");

  const invalidAge = await client.validate.$get({
    query: { age: "17", email: "test@example.com" },
  });
  console.log("Invalid age response:", await invalidAge.json());

  const invalidEmail = await client.validate.$get({
    query: { age: "20", email: "invalid-email" },
  });
  console.log("Invalid email response:", await invalidEmail.json());

  const ageOut = await client.validate.$get({
    query: { age: "101", email: "test@example.com" },
  });
  console.log("Age out of range:", await ageOut.json());

  const validRes = await client.validate.$get({
    query: { age: "25", email: "valid@example.com" },
  });
  if (validRes.ok)
    console.log("Valid request response:", await validRes.json());
}

main().catch(console.error);
