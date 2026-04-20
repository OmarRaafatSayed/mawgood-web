import { ExecArgs } from "@medusajs/framework/types";

export default async function run({ container }: ExecArgs) {
  const query = container.resolve("query");
  try {
    const res = await query.graph({
      entity: "stock_location",
      fields: [
        "name",
        "*sales_channels",
        "*address",
        "*fulfillment_sets",
        "*fulfillment_sets.service_zones",
        "*fulfillment_sets.service_zones.shipping_options",
      ]
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Query Error:", err);
  }
}
