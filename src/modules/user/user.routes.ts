import { Router, type Request, type Response } from "express";
import { userController } from "./user.controller";

const router = Router()

router.get("/", userController.allUsers)

export const userRoute = router