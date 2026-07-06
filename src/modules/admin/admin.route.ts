import { Router } from "express";
import { adminController } from "./admin.controller";
import auth from "../../middlewares/auth";
import authorize from "../../middlewares/authorize";

const router = Router()

router.use(auth, authorize("admin"))

router.get("/users", adminController.getAllUsers)
router.patch("/users/:id", adminController.updateUserStatus)
router.get("/bookings", adminController.getAllBookings)
router.get("/categories", adminController.getAllCategories)
router.post("/categories", adminController.createCategory)

export const adminRoute = router
