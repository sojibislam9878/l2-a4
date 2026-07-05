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





export const userController = {
    allUsers
}