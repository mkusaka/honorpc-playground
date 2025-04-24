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
}

main().catch(console.error);
