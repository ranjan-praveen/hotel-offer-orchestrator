import { proxyActivities } from "@temporalio/workflow";

import type * as activities from "../activities/supplierActivities";
import type * as redisActivities from "../activities/redisActivities";

const { fetchSupplierA, fetchSupplierB } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "10 seconds",
});

const { saveHotels } = proxyActivities<typeof redisActivities>({
  startToCloseTimeout: "10 seconds",
});

export async function offerWorkflow(city: string) {
  const [supplierA, supplierB] = await Promise.all([
    fetchSupplierA(city),
    fetchSupplierB(city),
  ]);

  const hotels = [...supplierA, ...supplierB];

  const bestHotels = new Map<string, (typeof hotels)[number]>();

  for (const hotel of hotels) {
    const existing = bestHotels.get(hotel.name);

    if (!existing || hotel.price < existing.price) {
      bestHotels.set(hotel.name, hotel);
    }
  }

  const result = Array.from(bestHotels.values());

  await saveHotels(city, result);

  return result;
}