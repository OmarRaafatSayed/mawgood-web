import { ExecArgs } from "@medusajs/framework/types";
import { createDefaultStoreShipping } from "./fix-shipping";

export default async function run({ container }: ExecArgs) {
  try {
    await createDefaultStoreShipping(container);
    console.log("✅ Done!");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}
