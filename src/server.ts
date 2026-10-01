import express from "express";
import { getTemporalClient } from "./client";
import { offerWorkflow } from "./workflows/offerWorkflow";
import Redis from "ioredis";
import axios from "axios";

const app = express();
const redis = new Redis("redis://localhost:6379");

const PORT = 3000;
const SUPPLIER_BASE_URL = "http://localhost:3000";

app.use(express.json());

app.get("/health", async (_req, res) => {
  const checkSupplier = async (url: string) => {
    try {
      await axios.get(url, { timeout: 3000 });
      return "healthy";
    } catch {
      return "unhealthy";
    }
  };

  const [supplierA, supplierB] = await Promise.all([
    checkSupplier(`${SUPPLIER_BASE_URL}/supplierA/hotels`),
    checkSupplier(`${SUPPLIER_BASE_URL}/supplierB/hotels`),
  ]);

  const overall =
    supplierA === "healthy" && supplierB === "healthy"
      ? "healthy"
      : "degraded";

  res.status(overall === "healthy" ? 200 : 503).json({
    status: overall,
    suppliers: {
      supplierA,
      supplierB,
    },
  });
});


app.get("/api/hotels", async (req, res) => {
  try {
    const city = String(req.query.city || "");

    if (!city) {
      return res.status(400).json({
        error: "city is required",
      });
    }

    const minPrice =
      req.query.minPrice !== undefined
        ? Number(req.query.minPrice)
        : undefined;

    const maxPrice =
      req.query.maxPrice !== undefined
        ? Number(req.query.maxPrice)
        : undefined;

    if (minPrice !== undefined && Number.isNaN(minPrice)) {
      return res.status(400).json({
        error: "minPrice must be a number",
      });
    }

    if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
      return res.status(400).json({
        error: "maxPrice must be a number",
      });
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return res.status(400).json({
        error: "minPrice cannot be greater than maxPrice",
      });
    }

    // Start Temporal workflow.
    // The workflow fetches suppliers, compares offers,
    // deduplicates hotels, and saves the result to Redis.
    const client = await getTemporalClient();

    const workflowId = `hotel-offers-${city}-${Date.now()}`;

    const handle = await client.workflow.start(offerWorkflow, {
      taskQueue: "hotel-offer-task-queue",
      workflowId,
      args: [city],
    });

    await handle.result();

    // Redis sorted set:
    // key   = hotels:${city}
    // score = hotel price
    // value = hotelId
    const redisKey = `hotels:${city}`;

    const min = minPrice !== undefined ? minPrice : "-inf";
    const max = maxPrice !== undefined ? maxPrice : "+inf";

    const hotelIds = await redis.zrangebyscore(redisKey, min, max);

    if (hotelIds.length === 0) {
      return res.json([]);
    }

    // Fetch the complete hotel objects from Redis.
    const hotelData = await Promise.all(
      hotelIds.map((hotelId) =>
        redis.get(`hotel:${city}:${hotelId}`)
      )
    );

    const hotels = hotelData
      .filter((hotel): hotel is string => hotel !== null)
      .map((hotel) => JSON.parse(hotel));

    res.json(hotels);
  } catch (error) {
    console.error("Failed to get hotel offers:", error);

    res.status(500).json({
      error: "Failed to get hotel offers",
    });
  }
});


const supplierAHotels = [
  {
    hotelId: "a1",
    name: "Holtin",
    price: 6000,
    city: "delhi",
    commissionPct: 10,
  },
  {
    hotelId: "a2",
    name: "Radison",
    price: 5900,
    city: "delhi",
    commissionPct: 13,
  },
  {
    hotelId: "a3",
    name: "Taj",
    price: 8000,
    city: "delhi",
    commissionPct: 15,
  },
];

const supplierBHotels = [
  {
    hotelId: "b1",
    name: "Holtin",
    price: 5340,
    city: "delhi",
    commissionPct: 20,
  },
  {
    hotelId: "b2",
    name: "Radison",
    price: 6200,
    city: "delhi",
    commissionPct: 12,
  },
  {
    hotelId: "b3",
    name: "Taj",
    price: 7500,
    city: "delhi",
    commissionPct: 18,
  },
  {
    hotelId: "b4",
    name: "Marriot",
    price: 7000,
    city: "delhi",
    commissionPct: 16,
  },
];

app.get("/supplierA/hotels", (req, res) => {
  const city = String(req.query.city || "").toLowerCase();

  const hotels = supplierAHotels.filter(
    (hotel) => hotel.city.toLowerCase() === city
  );

  res.json(hotels);
});

app.get("/supplierB/hotels", (req, res) => {
  const city = String(req.query.city || "").toLowerCase();

  const hotels = supplierBHotels.filter(
    (hotel) => hotel.city.toLowerCase() === city
  );

  res.json(hotels);
});


app.listen(PORT, () => {
  console.log(`Hotel Offer Orchestrator running on port ${PORT}`);
});