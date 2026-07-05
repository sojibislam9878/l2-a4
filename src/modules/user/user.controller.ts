import type { Request, Response } from "express"
import { userService } from "./user.service"
import jwt from "jsonwebtoken"
import envConfig from "../../config/envConfiq"

const allUsers =async (req: Request, res: Response)=>{
    try {
      const result = await userService.getAllUsersDb()
    //   sendResponse(res,{message: "Login successfully",data: result},200);
    res.status(200).json({
        status:200,
        message:"all data get",
        data: result
    })
      
    } catch (error) {
        
    }
}

const registerUser= async (req: Request, res:Response)=>{
    try {
        const payload = req.body;
        const result = await userService.resisterUserInDB(payload)

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
    const {accessToken} = req.cookies;
    const verifiedToken = jwt.verify(accessToken, envConfig.jwt_access_secret)



    const result = await userService.getMeDB()

    console.log(verifiedToken)

    res.status(200).json({
        status:200,
        message:"user created successfully",
        data: result
    })
}

export const userController = {
    allUsers, registerUser, getMe
}