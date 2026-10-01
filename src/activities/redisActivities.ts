import Redis from "ioredis";
import type { HotelOffer } from "./supplierActivities";

const redis = new Redis("redis://localhost:6379");

export async function saveHotels(
  city: string,
  hotels: HotelOffer[]
): Promise<void> {
  const key = `hotels:${city}`;

  await redis.del(key);

  const pipeline = redis.pipeline();

  for (const hotel of hotels) {
    pipeline.zadd(key, hotel.price, hotel.hotelId);
    pipeline.set(
      `hotel:${city}:${hotel.hotelId}`,
      JSON.stringify(hotel)
    );
  }

  await pipeline.exec();
}