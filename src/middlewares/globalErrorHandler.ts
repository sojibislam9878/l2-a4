import type { ErrorRequestHandler } from "express";
import { Prisma } from "../../generated/prisma/client";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError";

const { JsonWebTokenError, TokenExpiredError } = jwt;

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = "Something went wrong!";

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = 409;
            message = "Duplicate value. This record already exists.";
        } else if (err.code === "P2025") {
            statusCode = 404;
            message = "Record not found.";
        } else {
            statusCode = 400;
            message = "Database request error.";
        }
    } else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid data provided.";
    } else if (err instanceof TokenExpiredError) {
        statusCode = 401;
        message = "Token has expired. Please log in again.";
    } else if (err instanceof JsonWebTokenError) {
        statusCode = 401;
        message = "Invalid token.";
    } else if (err instanceof Error) {
        message = err.message;
    }

    console.log(err);

    res.status(statusCode).json({
        status: statusCode,
        message,
        error: err,
    });
};

export default globalErrorHandler;
