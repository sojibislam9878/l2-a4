import { prisma } from "../../lib/prisma";
import AppError from "../../../utils/AppError";
import type { ICreateReviewPayload } from "./review.interface";

const createReviewDb = async (
    customerId: string,
    payload: ICreateReviewPayload,
) => {
    const { booking_id, rating, comment } = payload;

    if (!rating || rating < 1 || rating > 5) {
        throw new AppError(400, "Rating must be between 1 and 5");
    }

    const booking = await prisma.booking.findUnique({
        where: { id: booking_id },
    });

    if (!booking) {
        throw new AppError(404, "Booking not found");
    }

    if (booking.customer_id !== customerId) {
        throw new AppError(403, "You are not allowed to review this booking");
    }

    if (booking.status !== "completed") {
        throw new AppError(400, "You can only review after the job is completed");
    }

    const existingReview = await prisma.review.findFirst({
        where: { booking_id, customer_id: customerId },
    });

    if (existingReview) {
        throw new AppError(409, "You have already reviewed this booking");
    }

    const result = await prisma.review.create({
        data: {
            booking_id,
            customer_id: customerId,
            technician_id: booking.technician_id,
            rating,
            comment,
        },
    });

    return result;
};

export const reviewService = {
    createReviewDb,
};
