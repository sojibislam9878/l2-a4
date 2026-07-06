import type { NextFunction, Request, Response } from "express";
import { categoryService } from "./category.service";

const getCategories = async (
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

export const categoryController = {
  getCategories,
};
