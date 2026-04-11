import { Worker } from "bullmq";
import { percentileCalculationQueueName } from "../constants/queueNames.js";
import PercentileService from "../services/percentile.service.js";
import connection from "../utils/ioRedis.js";

interface PercentileJobData {
  domainId: string;
}

const percentileWorker = new Worker(
  percentileCalculationQueueName,
  async (job) => {
    console.log(`Processing percentile calculation job ${job.id}`);
    const { domainId } = job.data as PercentileJobData;
    await PercentileService.calculatePercentilesForDomain(domainId);
  },
  {
    connection: connection,
  },
);

percentileWorker.on("completed", (job) => {
  console.log(`Percentile calculation job ${job.id} has completed`);
});

percentileWorker.on("failed", (job, err) => {
  console.error(
    `Percentile calculation job ${job?.id} has failed with error: ${err.message}`,
  );
});

export default percentileWorker;
