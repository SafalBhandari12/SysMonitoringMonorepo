import { Queue } from "bullmq";
import connection from "../utils/ioRedis.js";
import { domainVerficationQueueName } from "../constants/queueNames.js";

const domainVerificationQueue = new Queue(domainVerficationQueueName, {
  connection: connection,
});

export default domainVerificationQueue;
