import type { NextFunction, Request, Response } from "express"
import { servicesService } from "./service.service"

const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await servicesService.getServicesFromDb()

        res.status(200).json({
            status: 200,
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

        res.status(201).json({
            status: 201,
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
