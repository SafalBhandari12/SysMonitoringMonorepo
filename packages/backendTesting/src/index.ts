import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import { createMonitorMiddleware } from "../../sysMonitoring/dist/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const SYS_MONITOR_API_KEY = process.env.SYS_MONITOR_API_KEY;
const SYS_MONITOR_ENDPOINT = process.env.SYS_MONITOR_ENDPOINT;

if (!SYS_MONITOR_API_KEY || !SYS_MONITOR_ENDPOINT) {
  throw new Error("SYS_MONITOR_API_KEY and SYS_MONITOR_ENDPOINT must be set");
}

app.use(
  createMonitorMiddleware({
    apiKey: SYS_MONITOR_API_KEY,
    endpoint: SYS_MONITOR_ENDPOINT,
  }),
);
app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
