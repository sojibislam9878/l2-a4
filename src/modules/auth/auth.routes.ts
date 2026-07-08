import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router()

router.post("/login", authController.userLogin)
router.post("/register", authController.registerUser)
router.get("/me", authController.getMe)

export const authRoute = router
