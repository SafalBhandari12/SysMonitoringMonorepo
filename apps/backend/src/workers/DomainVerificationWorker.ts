import { Worker } from "bullmq";
import connection from "../utils/ioRedis.js";
import { domainVerficationQueueName } from "../constants/queueNames.js";



const worker = new Worker(
  domainVerficationQueueName,
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
  },
  {
    connection: connection,
  },
);

worker.on("completed", (job) => {
  console.log(`Job with id ${job.id} has completed!`);
});

worker.on("failed", (job, err) => {
  console.log(`Job has failed with error: ${err.message}`);
});
