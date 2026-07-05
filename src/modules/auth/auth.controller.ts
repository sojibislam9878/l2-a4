import type { Request, Response } from "express"
import { authService } from "./auth.service"

const userLogin = async (req: Request, res: Response) => {
    try {
        const payload = req.body
        const {accessToken, refreshToken, userWithoutPassword} = await authService.userLogInDB(payload)

        res.cookie("accessToken", accessToken, {
            httpOnly:true,
            secure: false, 
            sameSite: "none",
            maxAge: 1000 * 60 * 60  * 24
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            secure: false, 
            sameSite: "none",
            maxAge: 1000 * 60 * 60  * 24 * 7
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

export const authController = {
    userLogin
}