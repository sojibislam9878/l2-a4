import type { NextFunction, Request, Response } from "express"
import { authService } from "./auth.service"
import envConfig from '../../config/envConfiq';
import jwt, { type JwtPayload } from "jsonwebtoken"
import { sendResponse } from "../../../utils/response"

const userLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body
        const { accessToken, userWithoutPassword } = await authService.userLogInDB(payload)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24
        })

        sendResponse(res, {
            statusCode: 200,
            message: "user login successfully",
            data: userWithoutPassword,
        })
    } catch (error) {
        next(error)
    }
}

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const payload = req.body;
        const result = await authService.registerUserDB(payload)

        sendResponse(res, {
            statusCode: 201,
            message: "user created successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { accessToken } = req.cookies;
        const verifiedToken = jwt.verify(accessToken, envConfig.jwt_access_secret) as JwtPayload

        const result = await authService.getMeDB(verifiedToken.id)

        sendResponse(res, {
            statusCode: 200,
            message: "user fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const authController = {
    userLogin,
    registerUser,
    getMe
}
