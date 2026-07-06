import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type { ITechnicianFilters } from "./technician.interface";
import AppError from "../../../utils/AppError";

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

export const technicianService = {
  getTechniciansFormDb,
  getTechnicianByIdFromDb,
};
