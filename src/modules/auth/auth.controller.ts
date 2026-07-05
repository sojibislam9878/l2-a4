import { sendResponse } from './../../../utils/response';
import type { Request, Response } from "express"
import { authService } from "./auth.service"
import envConfig from '../../config/envConfiq';
import jwt, { type JwtPayload } from "jsonwebtoken"

const userLogin = async (req: Request, res: Response) => {
    try {
        const payload = req.body
        const {accessToken, userWithoutPassword} = await authService.userLogInDB(payload)

        res.cookie("accessToken", accessToken, {
            httpOnly:true,
            secure: false, 
            sameSite: "none",
            maxAge: 1000 * 60 * 60  * 24
        })

        res.status(200).json({
        status:200,
        message:"user login successfully",
        data: userWithoutPassword
    })

    } catch (error) {
        console.log(error)
        res.status(400).json({
        status:400,
        message:"something wrong!!",
        error: error
    })
    }
}

const registerUser= async (req: Request, res:Response)=>{
    try {
        const payload = req.body;
        const result = await authService.registerUserDB(payload)

        res.status(200).json({
        status:200,
        message:"user created successfully",
        data: result
    })
    } catch (error) {
        console.log(error)
        res.status(400).json({
        status:400,
        message:"something wrong!!",
        error: error
    })
        
    }
}

const getMe = async (req: Request, res: Response)=>{
    try {
        const {accessToken} = req.cookies;
        const verifiedToken = jwt.verify(accessToken, envConfig.jwt_access_secret) as JwtPayload

        const result = await authService.getMeDB(verifiedToken.id)

        res.status(200).json({
            status:200,
            message:"user fetched successfully",
            data: result
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            status:400,
            message:"something wrong!!",
            error: error
        })
    }
}

export const authController = {
    userLogin,
    registerUser,
    getMe
}