import type { Response } from "express";

interface ResponsePayload<T> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T;
    error?: unknown;
}

export const sendResponse = <T>(
    res: Response,
    payload: ResponsePayload<T>
) => {
    const { statusCode, success, message, data, error } = payload;

    res.status(statusCode).json({
        success,
        message,
        ...(data !== undefined && { data }),
        ...(error !== undefined && { error }),
    });
};
