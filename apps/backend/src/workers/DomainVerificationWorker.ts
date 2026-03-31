import { Worker } from "bullmq";
import connection from "../utils/ioRedis.js";
import { domainVerficationQueueName } from "../constants/queueNames.js";
import type { domainVerificationJobDataType } from "../types/domainWorker.type.js";
import DomainService from "../services/domain.service.js";

const worker = new Worker(
  domainVerficationQueueName,
  async (job) => {
    const { domain } = job.data as domainVerificationJobDataType;
    console.log(`Processing job for domain: ${domain}`);
    const result = await DomainService.verifyDomain(domain);
    if (result.verificationStatus !== "VERIFIED") {
      throw new Error(`Domain ${domain} verification failed`);
    }
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
