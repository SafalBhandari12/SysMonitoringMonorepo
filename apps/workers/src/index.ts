import connection from "./utils/redis.js";
import { Worker } from "bullmq";
import queueName from "./utils/getQueueName.js";
import type { jobDataType } from "./types/job.js";

import prisma from "@repo/db/client";

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(job.id);
    const { apiId } = job.data as jobDataType;
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
