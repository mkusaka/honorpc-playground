import type { AppType } from "./server";
import { hc } from "hono/client";

async function main() {
  const client = hc<AppType>("http://localhost:8787");

  // 存在しないID→404
  const res404 = await client.posts.$get({ query: { id: "2" } });
  console.log(res404.status, res404.ok); // 404 false

  if (!res404.ok) {
    const err = (await res404.json()) as { error: string };
    console.error("Error:", err.error);
  }

  // 正常系
  const res200 = await client.posts.$get({ query: { id: "1" } });
  if (res200.ok) {
    const { post } = (await res200.json()) as {
      post: { id: string; title: string };
    };
    console.log("Success:", post);
  }

  // Zod validation error tests
  console.log("\nTesting Zod validation errors:");

  // Invalid age (string instead of number)
  const invalidAgeRes = await client.validate.$get({ 
    query: { age: "17", email: "test@example.com" } 
  });
  console.log("Invalid age response:", await invalidAgeRes.json());

  // Invalid email format
  const invalidEmailRes = await client.validate.$get({ 
    query: { age: "20", email: "invalid-email" } 
  });
  console.log("Invalid email response:", await invalidEmailRes.json());

  // Age out of range
  const ageOutOfRangeRes = await client.validate.$get({ 
    query: { age: "101", email: "test@example.com" } 
  });
  console.log("Age out of range response:", await ageOutOfRangeRes.json());

  // Valid request
  const validRes = await client.validate.$get({ 
    query: { age: "25", email: "valid@example.com" } 
  });
  if (validRes.ok) {
    const data = await validRes.json();
    console.log("Valid request response:", data);
  }
}

main().catch(console.error);
