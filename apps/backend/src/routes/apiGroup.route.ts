import { Router } from "express";
import ApiGroupController from "../controller/apiGroup.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { authenticationMiddleware } from "../middleware/authentication.middleware.js";

const router = Router();

router.use(authenticationMiddleware);

router.post("/create", asyncHandler(ApiGroupController.createApiGroup));

router.get("/all", asyncHandler(ApiGroupController.getAllApiGroups));

router.get(
  "/:apiGroupId",
  asyncHandler(ApiGroupController.getSpecificApiGroup),
);

export default router;
