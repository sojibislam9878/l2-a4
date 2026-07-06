import type { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";
import { categoryService } from "../category/category.service";
import type { ActiveStatus } from "../../../generated/prisma/client";
import AppError from "../../../utils/AppError";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAllUsersDb();

    res.status(200).json({
      status: 200,
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

    res.status(200).json({
      status: 200,
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

    res.status(200).json({
      status: 200,
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

    res.status(200).json({
      status: 200,
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

    res.status(201).json({
      status: 201,
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
