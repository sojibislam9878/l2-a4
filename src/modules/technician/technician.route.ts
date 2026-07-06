import { Router } from "express";
import { technicianController } from "./technician.controller";

const router = Router()

router.get("/", technicianController.getTechnicians)
router.get("/:id", technicianController.getTechnicianById)

export const technicianRoute = router
