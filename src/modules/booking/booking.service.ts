import { prisma } from "../../lib/prisma";
import AppError from "../../../utils/AppError";
import type { ICreateBookingPayload } from "./booking.interface";

const createBookingDb = async (
  customerId: string,
  payload: ICreateBookingPayload,
) => {
  const service = await prisma.service.findUnique({
    where: { id: payload.service_id },
    include: { technician: true },
  });

  if (!service) {
    throw new AppError(404, "Service not found");
  }

  if (service.technician.user_id === customerId) {
    throw new AppError(400, "You cannot book your own service");
  }

  const result = await prisma.booking.create({
    data: {
      customer_id: customerId,
      technician_id: service.technician_id,
      service_id: service.id,
      scheduled_at: new Date(payload.scheduled_at),
      address: payload.address,
      ...(payload.note !== undefined && { note: payload.note }),
    },
  });

  return result;
};

const getUserBookingsDb = async (customerId: string) => {
  const data = await prisma.booking.findMany({
    where: { customer_id: customerId },
    orderBy: { created_at: "desc" },
  });

  return data;
};

const getBookingByIdDb = async (id: string, customerId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_no: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      service: true,
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.customer_id !== customerId) {
    throw new AppError(403, "You are not allowed to access this booking");
  }

  return booking;
};

export const bookingService = {
  createBookingDb,
  getUserBookingsDb,
  getBookingByIdDb,
};
