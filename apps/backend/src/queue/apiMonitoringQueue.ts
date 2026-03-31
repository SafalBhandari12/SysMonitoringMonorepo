import { Queue } from "bullmq";
import connection from "../utils/ioRedis.js";
import { apiMonitoringQueuePrefix } from "../constants/queueNames.js";

const getApiMonitoringQueue = (region: string) => {
  const queueName = `${apiMonitoringQueuePrefix}-${region}`;
  console.log("creating queue with name: ", queueName);
  return new Queue(queueName, {
    connection: connection,
  });
};

export default getApiMonitoringQueue;
