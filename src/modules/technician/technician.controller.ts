import type { NextFunction, Request, Response } from "express"
import { technicianService } from "./technician.service"
import type { ITechnicianFilters } from "./technician.interface"

const getTechnicians = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filters = req.query as ITechnicianFilters
        const result = await technicianService.getTechniciansFormDb(filters)

        res.status(200).json({
            status: 200,
            message: "technicians fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const getTechnicianById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const result = await technicianService.getTechnicianByIdFromDb(id as string)

        res.status(200).json({
            status: 200,
            message: "technician fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const technicianController = {
    getTechnicians,
    getTechnicianById
}
