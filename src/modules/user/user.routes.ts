import { Router, type Request, type Response } from "express";
import { userController } from "./user.controller";

const router = Router()

router.get("/", userController.allUsers)
router.post("/register", userController.registerUser)
router.get("/me", userController.getMe)

export const userRoute = router