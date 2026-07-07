import type { NextFunction, Request, Response } from "express"
import type Stripe from "stripe"
import { paymentService } from "./payment.service"
import { stripe } from "../../lib/stripe"
import envConfig from "../../config/envConfiq"
import { sendResponse } from "../../../utils/response"

const createPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const { booking_id } = req.body

        const result = await paymentService.createPaymentDb(customerId, booking_id)

        sendResponse(res, {
            statusCode: 201,
            message: "payment session created successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const confirmPayment = async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"] as string

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            envConfig.stripe_webhook_key,
        )
    } catch (error) {
        console.log("Webhook signature verification failed:", error)
        return res.status(400).send("Webhook signature verification failed")
    }

    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session
            await paymentService.markPaymentPaidDb(session.id)
            break
        }
        case "checkout.session.expired":
        case "checkout.session.async_payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session
            await paymentService.markPaymentFailedDb(session.id)
            break
        }
    }

    res.status(200).json({ received: true })
}

const getMyPayments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const result = await paymentService.getUserPaymentsDb(customerId)

        sendResponse(res, {
            statusCode: 200,
            message: "payments fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerId = (req as Request & { user?: { id: string } }).user!.id
        const { id } = req.params
        const result = await paymentService.getPaymentByIdDb(id as string, customerId)

        sendResponse(res, {
            statusCode: 200,
            message: "payment fetched successfully",
            data: result,
        })
    } catch (error) {
        next(error)
    }
}

export const paymentController = {
    createPayment,
    confirmPayment,
    getMyPayments,
    getPaymentById
}
