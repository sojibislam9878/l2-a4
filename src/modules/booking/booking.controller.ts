import type { NextFunction, Request, Response } from "express"
import { bookingService } from "./booking.service"
import { sendResponse } from "../../../utils/response"

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const payload = req.body
        const result = await bookingService.createBookingDb(customerId, payload)

        sendResponse(res, {
            statusCode: 201,
            message: "booking created successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const result = await bookingService.getUserBookingsDb(customerId)

        sendResponse(res, {
            statusCode: 200,
            message: "bookings fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const { id } = req.params
        const result = await bookingService.getBookingByIdDb(id as string, customerId)

        sendResponse(res, {
            statusCode: 200,
            message: "booking fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const bookingController = {
    createBooking,
    getMyBookings,
    getBookingById
}
