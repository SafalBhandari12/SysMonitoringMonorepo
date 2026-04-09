import { Router } from "express";
import domainRouter from "./domain.route.js";
import apiRouter from "./api.route.js";
import apiGroupRouter from "./apiGroup.route.js";
import authRouter from "./auth.route.js";
import incidentRouter from "./incident.route.js";

const router = Router();

router.use("/domain", domainRouter);
router.use("/api", apiRouter);
router.use("/api-group", apiGroupRouter);
router.use("/auth", authRouter);
router.use("/incident", incidentRouter);

export default router;
