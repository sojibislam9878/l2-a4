import { prisma } from "../../lib/prisma";

const getCategoriesFromDb = async () => {
  const data = await prisma.category.findMany({
    orderBy: { created_at: "desc" },
  });

  return data;
};

export const categoryService = {
  getCategoriesFromDb,
};
