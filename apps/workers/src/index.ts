import connection from "./utils/redis.js";
import { Worker } from "bullmq";

const region = process.env.region || "IN";
const queueName = `api-monitoring-queue-${region}`;
console.log(`Worker is running for region: ${region} and queue: ${queueName}`);

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(job.id);
    console.log(job.data);
  },
  {
    connection,
  },
);

worker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`Job has failed with error ${err.message}`);
});
