import { prisma } from "../../lib/prisma";
import AppError from "../../../utils/AppError";
import type { ActiveStatus } from "../../../generated/prisma/client";
import type { ICategory } from "../category/category.interface";

const userSelect = {
    id: true,
    name: true,
    email: true,
    phone_no: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
};

const getAllUsersDb = async () => {
    const data = await prisma.user.findMany({
        select: userSelect,
        orderBy: { createdAt: "desc" },
    });

    return data;
};

const updateUserStatusDb = async (userId: string, status: ActiveStatus) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new AppError(404, "User not found");
    }

    const result = await prisma.user.update({
        where: { id: userId },
        data: { status },
        select: userSelect,
    });

    return result;
};

const getAllBookingsDb = async () => {
    const data = await prisma.booking.findMany({
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

const createCategoryDb = async (payload: ICategory) => {
    const result = await prisma.category.create({
        data: {
            name: payload.name,
            description: payload.description,
        },
    });

    return result;
};

export const adminService = {
    getAllUsersDb,
    updateUserStatusDb,
    getAllBookingsDb,
    createCategoryDb,
};
