import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../../utils/AppError";
import type {
    ICreateServicePayload,
    IServiceFilters,
} from "./service.interface";

const getServicesFromDb = async (filters: IServiceFilters) => {
    const {
        searchTerm,
        category_id,
        technician_id,
        minPrice,
        maxPrice,
        sortBy,
        sortOrder,
    } = filters;

    const andConditions: Prisma.ServiceWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } },
                { category: { name: { contains: searchTerm, mode: "insensitive" } } },
                {
                    technician: {
                        user: { name: { contains: searchTerm, mode: "insensitive" } },
                    },
                },
            ],
        });
    }

    if (category_id) {
        andConditions.push({ category_id });
    }

    if (technician_id) {
        andConditions.push({ technician_id });
    }

    if (minPrice || maxPrice) {
        andConditions.push({
            price: {
                ...(minPrice && { gte: Number(minPrice) }),
                ...(maxPrice && { lte: Number(maxPrice) }),
            },
        });
    }

    const whereConditions: Prisma.ServiceWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const allowedSortFields = ["price", "title", "created_at"];
    const sortField = allowedSortFields.includes(sortBy || "")
        ? (sortBy as string)
        : "created_at";
    const sortDirection = sortOrder === "asc" ? "asc" : "desc";

    const data = await prisma.service.findMany({
        where: whereConditions,
        orderBy: { [sortField]: sortDirection },
        include: {
            category: true,
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
            review: {
                select: {
                    rating: true,
                    comment: true,
                    customer_id: true,
                },
            },
        },
    });

    return data;
};

const createServiceDb = async (
    userId: string,
    payload: ICreateServicePayload,
) => {
    const profile = await prisma.technicianProfile.findUnique({
        where: { user_id: userId },
    });

    if (!profile) {
        throw new AppError(404, "Technician profile not found");
    }

    const category = await prisma.category.findUnique({
        where: { id: payload.category_id },
    });

    if (!category) {
        throw new AppError(404, "Category not found");
    }

    const result = await prisma.service.create({
        data: {
            technician_id: profile.id,
            category_id: payload.category_id,
            title: payload.title,
            description: payload.description,
            price: Number(payload.price),
        },
    });

    return result;
};

export const servicesService = {
    getServicesFromDb,
    createServiceDb,
};
