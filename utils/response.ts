import type { Response } from "express";

interface ResponsePayload<T> {
    statusCode: number;
    success?: boolean;
    message: string;
    data?: T;
}

export const sendResponse = <T>(res: Response, payload: ResponsePayload<T>) => {
    const { statusCode, message, data } = payload;
    const success = payload.success ?? statusCode < 400;

    res.status(statusCode).json({
        success,
        statusCode,
        message,
        ...(data !== undefined && { data }),
    });
};
