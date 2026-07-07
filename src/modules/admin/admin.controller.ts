import type { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import { categoryService } from "../category/category.service";
import type { ActiveStatus } from "../../../generated/prisma/client";
import AppError from "../../../utils/AppError";
import { sendResponse } from "../../../utils/response";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAllUsersDb();

    sendResponse(res, {
      statusCode: 200,
      message: "users fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: ActiveStatus };

    const allowedStatus: ActiveStatus[] = ["unban", "ban"];
    if (!status || !allowedStatus.includes(status)) {
      throw new AppError(400, "Invalid status. status: unban, ban");
    }

    const result = await adminService.updateUserStatusDb(id as string, status);

    sendResponse(res, {
      statusCode: 200,
      message: "user status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.getAllBookingsDb();

    sendResponse(res, {
      statusCode: 200,
      message: "bookings fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await categoryService.getCategoriesFromDb();

    sendResponse(res, {
      statusCode: 200,
      message: "categories fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await adminService.createCategoryDb(req.body);

    sendResponse(res, {
      statusCode: 201,
      message: "category created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  getAllUsers,
  updateUserStatus,
  getAllBookings,
  getAllCategories,
  createCategory,
};
