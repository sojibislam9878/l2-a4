import { Router } from "express";
import { paymentController } from "./payment.controller";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";

const router = Router()

router.post("/create", auth, authorize("customer"), paymentController.createPayment)
router.get("/", auth, authorize("customer"), paymentController.getMyPayments)
router.get("/:id", auth, authorize("customer"), paymentController.getPaymentById)

export const paymentRoute = router
