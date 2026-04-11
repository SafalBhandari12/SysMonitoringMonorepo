import { Queue } from "bullmq";
import connection from "../utils/ioRedis.js";
import { percentileCalculationQueueName } from "../constants/queueNames.js";

const percentileCalculationQueue = new Queue(percentileCalculationQueueName, {
  connection: connection,
});

export default percentileCalculationQueue;
