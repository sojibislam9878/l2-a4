import type { NextFunction, Request, Response } from "express";
import { technicianService } from "./technician.service";
import type { ITechnicianFilters } from "./technician.interface";
import type { BookingStatus } from "../../../generated/prisma/client";
import AppError from "../../../utils/AppError";

const getTechnicians = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = req.query as ITechnicianFilters;
    const result = await technicianService.getTechniciansFormDb(filters);

    res.status(200).json({
      status: 200,
      message: "technicians fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTechnicianById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await technicianService.getTechnicianByIdFromDb(
      id as string,
    );

    res.status(200).json({
      status: 200,
      message: "technician fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user!.id;
    const result = await technicianService.updateTechnicianProfileDb(
      userId,
      req.body,
    );

    res.status(200).json({
      status: 200,
      message: "technician profile updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getTechnicianBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user!.id;
    const result = await technicianService.getTechnicianBookingsDb(userId);

    res.status(200).json({
      status: 200,
      message: "bookings fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as Request & { user?: { id: string } }).user!.id;
    const { id } = req.params;
    const { status } = req.body as { status: BookingStatus };

    const allowedStatus: BookingStatus[] = [
      "accepted",
      "declined",
      "completed",
    ];
    if (!status || !allowedStatus.includes(status)) {
      throw new AppError(
        400,
        "Invalid status. Allowed: accepted, declined, completed",
      );
    }

    const result = await technicianService.updateBookingStatusDb(
      userId,
      id as string,
      status,
    );

    res.status(200).json({
      status: 200,
      message: "booking status updated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const technicianController = {
  getTechnicians,
  getTechnicianById,
  updateProfile,
  getTechnicianBookings,
  updateBookingStatus,
};
