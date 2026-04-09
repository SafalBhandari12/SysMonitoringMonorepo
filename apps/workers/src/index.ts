import { Worker } from "bullmq";
import queueName from "./utils/getQueueName.js";
import type { jobDataType } from "./types/job.js";

import ApiService from "./service/api.service.js";
import redis from "./utils/redis.js";

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(job.id);
    const { apiId } = job.data as jobDataType;
    await ApiService.fetchAndStore(apiId);
  },
  {
    connection: redis,
  },
);

worker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job with id ${job?.id} has failed with error: ${err.message}`);
});
