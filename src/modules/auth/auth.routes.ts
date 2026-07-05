import { Router, type Request, type Response } from "express";
import { authController } from "./auth.controller";

const router = Router()

router.post("/login", authController.userLogin)

export const authRoute = router