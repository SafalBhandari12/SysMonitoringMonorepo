import { ENV } from "../constants/env.js";

const queueName = `api-monitoring-${ENV.REGION}`;

export default queueName;
