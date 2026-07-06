import { prisma } from "../../lib/prisma";

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

export const servicesService = {
    getServicesFromDb,
};
