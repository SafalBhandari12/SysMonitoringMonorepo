const region = process.env.region || "IN";
const queueName = `api-monitoring-${region}`;

export default queueName;
