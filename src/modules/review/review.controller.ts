import type { NextFunction, Request, Response } from "express"
import { reviewService } from "./review.service"
import { sendResponse } from "../../../utils/response"

const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const result = await reviewService.createReviewDb(customerId, req.body)

        sendResponse(res, {
            statusCode: 201,
            message: "review created successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const reviewController = {
    createReview
}
