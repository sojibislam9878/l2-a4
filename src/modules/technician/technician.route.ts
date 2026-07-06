import { Router } from "express";
import { technicianController } from "./technician.controller";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";

const router = Router();

router.get("/", technicianController.getTechnicians);
router.get("/:id", technicianController.getTechnicianById);

export const technicianRoute = router;

const managementRouter = Router();

managementRouter.put(
  "/profile",
  auth,
  authorize("technician"),
  technicianController.updateProfile,
);
managementRouter.put(
  "/availability",
  auth,
  authorize("technician"),
  technicianController.updateAvailability,
);
managementRouter.get(
  "/bookings",
  auth,
  authorize("technician"),
  technicianController.getTechnicianBookings,
);
managementRouter.patch(
  "/bookings/:id",
  auth,
  authorize("technician"),
  technicianController.updateBookingStatus,
);

export const technicianManagementRoute = managementRouter;
