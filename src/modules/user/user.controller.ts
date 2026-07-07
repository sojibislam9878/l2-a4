import type { NextFunction, Request, Response } from "express"
import { userService } from "./user.service"
import { sendResponse } from "../../../utils/response"

const allUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await userService.getAllUsersDb()

        sendResponse(res, {
            statusCode: 200,
            message: "all data get",
            data: result
        })
    } catch (error) {
        next(error)
    }
}

export const userController = {
    allUsers
}
