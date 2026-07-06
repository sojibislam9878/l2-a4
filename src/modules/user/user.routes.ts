import { Router } from "express";
import { userController } from "./user.controller";
import adminAuth from "../../middlewares/adminAuth";

const router = Router()

router.get("/", adminAuth ,userController.allUsers)

export const userRoute = router
