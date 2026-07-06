import { Router } from "express";
import { serviceController } from "./service.controller";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";

const router = Router()

router.get("/", serviceController.getServices)
router.post("/", auth, authorize("technician"), serviceController.createService)

export const serviceRoute = router
