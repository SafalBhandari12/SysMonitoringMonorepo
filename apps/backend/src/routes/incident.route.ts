import { Router } from "express";
import IncidentController from "../controller/incident.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { authenticationMiddleware } from "../middleware/authentication.middleware.js";

const router = Router();

router.use(authenticationMiddleware);

router.get("/", asyncHandler(IncidentController.getAllIncidents));
router.get("/:id", asyncHandler(IncidentController.getIncidentById));
router.post("/", asyncHandler(IncidentController.createIncident));
router.put("/:id", asyncHandler(IncidentController.updateIncident));

export default router;
