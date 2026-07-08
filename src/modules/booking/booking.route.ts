import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";

const router = Router()

router.post("/", auth, authorize("customer", "technician"), bookingController.createBooking)
router.get("/", auth, authorize("customer", "technician"), bookingController.getMyBookings)
router.get("/:id", auth, authorize("customer", "technician"), bookingController.getBookingById)

export const bookingRoute = router
