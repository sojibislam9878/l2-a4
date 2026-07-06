import { Router } from "express";
import { bookingController } from "./booking.controller";
import auth from "../../middlewares/auth";

const router = Router()

router.post("/", auth, bookingController.createBooking)
router.get("/", auth, bookingController.getMyBookings)
router.get("/:id", auth, bookingController.getBookingById)

export const bookingRoute = router
