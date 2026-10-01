"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveHotels = saveHotels;
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default("redis://localhost:6379");
async function saveHotels(city, hotels) {
    const key = `hotels:${city}`;
    await redis.del(key);
    const pipeline = redis.pipeline();
    for (const hotel of hotels) {
        pipeline.zadd(key, hotel.price, hotel.hotelId);
        pipeline.set(`hotel:${city}:${hotel.hotelId}`, JSON.stringify(hotel));
    }
    await pipeline.exec();
}
//# sourceMappingURL=redisActivities.js.map