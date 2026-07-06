import { Router } from "express";
import { reviewController } from "./review.controller";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";

const router = Router()

router.post("/", auth, authorize("customer"), reviewController.createReview)

export const reviewRoute = router
