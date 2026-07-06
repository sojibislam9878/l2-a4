import { Prisma, type BookingStatus } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type {
  ITechnicianFilters,
  IUpdateTechnicianProfilePayload,
} from "./technician.interface";
import AppError from "../../../utils/AppError";

const getProfileByUserId = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { user_id: userId },
  });

  if (!profile) {
    throw new AppError(404, "Technician profile not found");
  }

  return profile;
};

const getTechniciansFormDb = async (filters: ITechnicianFilters) => {
  const {
    searchTerm,
    skills,
    minExperience,
    maxExperience,
    minRate,
    maxRate,
    sortBy,
    sortOrder,
  } = filters;

  const andConditions: Prisma.TechnicianProfileWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { skills: { contains: searchTerm, mode: "insensitive" } },
        { bio: { contains: searchTerm, mode: "insensitive" } },
        { user: { name: { contains: searchTerm, mode: "insensitive" } } },
        { user: { email: { contains: searchTerm, mode: "insensitive" } } },
      ],
    });
  }

  if (skills) {
    andConditions.push({
      skills: { contains: skills, mode: "insensitive" },
    });
  }

  if (minExperience || maxExperience) {
    andConditions.push({
      experience_year: {
        ...(minExperience && { gte: Number(minExperience) }),
        ...(maxExperience && { lte: Number(maxExperience) }),
      },
    });
  }

  if (minRate || maxRate) {
    andConditions.push({
      hourly_rate: {
        ...(minRate && { gte: Number(minRate) }),
        ...(maxRate && { lte: Number(maxRate) }),
      },
    });
  }

  const whereConditions: Prisma.TechnicianProfileWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const allowedSortFields = [
    "hourly_rate",
    "experience_year",
    "createdAt",
    "updatedAt",
  ];
  const sortField = allowedSortFields.includes(sortBy || "")
    ? (sortBy as string)
    : "createdAt";
  const sortDirection = sortOrder === "asc" ? "asc" : "desc";

  const data = await prisma.technicianProfile.findMany({
    where: whereConditions,
    orderBy: { [sortField]: sortDirection },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_no: true,
          role: true,
          status: true,
        },
      },
    },
  });

  return data;
};

const getTechnicianByIdFromDb = async (id: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_no: true,
          role: true,
          status: true,
        },
      },
      review: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });

  if (!technician) {
    throw new AppError(404, "Technician not found");
  }

  return technician;
};

const updateTechnicianProfileDb = async (
  userId: string,
  payload: IUpdateTechnicianProfilePayload,
) => {
  await getProfileByUserId(userId);

  const result = await prisma.technicianProfile.update({
    where: { user_id: userId },
    data: {
      ...(payload.bio !== undefined && { bio: payload.bio }),
      ...(payload.skills !== undefined && { skills: payload.skills }),
      ...(payload.experience_year !== undefined && {
        experience_year: Number(payload.experience_year),
      }),
      ...(payload.hourly_rate !== undefined && {
        hourly_rate: Number(payload.hourly_rate),
      }),
    },
  });

  return result;
};

const getTechnicianBookingsDb = async (userId: string) => {
  const profile = await getProfileByUserId(userId);

  const data = await prisma.booking.findMany({
    where: { technician_id: profile.id },
    orderBy: { created_at: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone_no: true,
        },
      },
      service: true,
    },
  });

  return data;
};

const updateBookingStatusDb = async (
  userId: string,
  bookingId: string,
  status: BookingStatus,
) => {
  const profile = await getProfileByUserId(userId);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(404, "Booking not found");
  }

  if (booking.technician_id !== profile.id) {
    throw new AppError(403, "You are not allowed to update this booking");
  }

  const result = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  return result;
};

export const technicianService = {
  getTechniciansFormDb,
  getTechnicianByIdFromDb,
  updateTechnicianProfileDb,
  getTechnicianBookingsDb,
  updateBookingStatusDb,
};
