import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import envConfig from "../../config/envConfiq";
import AppError from "../../../utils/AppError";

const createPaymentDb = async (customerId: string, bookingId: string) => {
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { service: true },
    });

    if (!booking) {
        throw new AppError(404, "Booking not found");
    }

    if (booking.customer_id !== customerId) {
        throw new AppError(403, "You are not allowed to pay for this booking");
    }

    if (booking.status !== "accept") {
        throw new AppError(400, "You can only pay for an accepted booking");
    }

    const existingPayment = await prisma.payment.findUnique({
        where: { booking_id: bookingId },
    });

    if (existingPayment && existingPayment.status === "completed") {
        throw new AppError(409, "This booking is already paid");
    }

    const amount = Number(booking.service.price);

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: { name: booking.service.title },
                    unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
            },
        ],
        success_url: `${envConfig.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envConfig.app_url}/payment/cancel`,
        metadata: {
            booking_id: bookingId,
            customer_id: customerId,
        },
    });

    const payment = await prisma.payment.upsert({
        where: { booking_id: bookingId },
        update: {
            transaction_id: session.id,
            amount,
            method: "stripe",
            status: "pending",
        },
        create: {
            booking_id: bookingId,
            transaction_id: session.id,
            amount,
            method: "stripe",
            status: "pending",
        },
    });

    return { url: session.url, payment };
};

const markPaymentPaidDb = async (sessionId: string) => {
    const payment = await prisma.payment.findFirst({
        where: { transaction_id: sessionId },
    });

    if (!payment) {
        return;
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "completed",
            paid_at: new Date(),
        },
    });
};

const markPaymentFailedDb = async (sessionId: string) => {
    const payment = await prisma.payment.findFirst({
        where: { transaction_id: sessionId },
    });

    // don't overwrite an already completed payment
    if (!payment || payment.status === "completed") {
        return;
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: "failed",
        },
    });
};

const getUserPaymentsDb = async (customerId: string) => {
    const data = await prisma.payment.findMany({
        where: { booking: { customer_id: customerId } },
        orderBy: { created_at: "desc" },
    });

    return data;
};

const getPaymentByIdDb = async (id: string, customerId: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
            booking: {
                include: { service: true },
            },
        },
    });

    if (!payment) {
        throw new AppError(404, "Payment not found");
    }

    if (payment.booking.customer_id !== customerId) {
        throw new AppError(403, "You are not allowed to access this payment");
    }

    return payment;
};

export const paymentService = {
    createPaymentDb,
    markPaymentPaidDb,
    markPaymentFailedDb,
    getUserPaymentsDb,
    getPaymentByIdDb,
};
