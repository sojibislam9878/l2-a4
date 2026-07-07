import type { NextFunction, Request, Response } from "express"
import { servicesService } from "./service.service"
import { sendResponse } from "../../../utils/response"

const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await servicesService.getServicesFromDb()

        sendResponse(res, {
            statusCode: 200,
            message: "services fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const createService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as Request & { user?: { id: string } }).user!.id
        const result = await servicesService.createServiceDb(userId, req.body)

        sendResponse(res, {
            statusCode: 201,
            message: "service created successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const serviceController = {
    getServices,
    createService
}
