import { prisma } from "../../lib/prisma";
import AppError from "../../../utils/AppError";
import type { ICreateServicePayload } from "./service.interface";

const getServicesFromDb = async () => {
    const data = await prisma.service.findMany({
        orderBy: { created_at: "desc" },
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
