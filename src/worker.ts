import { Worker } from "@temporalio/worker";
import * as activities from "./activities/supplierActivities";
import * as redisActivities from "./activities/redisActivities";

async function run() {
  const worker = await Worker.create({
    workflowsPath: require.resolve("./workflows/offerWorkflow"),
    activities: {
      ...activities,
      ...redisActivities,
    },
    taskQueue: "hotel-offer-task-queue",
  });

  console.log("Temporal worker started");

  await worker.run();
}

run().catch((error) => {
  console.error("Worker failed:", error);
  process.exit(1);
});