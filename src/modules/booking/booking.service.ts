import { prisma } from "../../lib/prisma";
import AppError from "../../../utils/AppError";
import type { ICreateBookingPayload } from "./booking.interface";

const createBookingDb = async (
  customerId: string,
  payload: ICreateBookingPayload,
) => {
  const result = await prisma.booking.create({
    data: {
      customer_id: customerId,
      technician_id: payload.technician_id,
      service_id: payload.service_id,
      scheduled_at: new Date(payload.scheduled_at),
      address: payload.address,
      note: payload.note,
    },
  });

  return result;
};

const getUserBookingsDb = async (customerId: string) => {
  const data = await prisma.booking.findMany({
    where: { customer_id: customerId },
    orderBy: { created_at: "desc" },
    include: {
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
    },
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
