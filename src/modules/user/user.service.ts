import envConfig from "../../config/envConfiq";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";

const getAllUsersDb = async () => {
  const data = await prisma.user.findMany();
  return data;
};





export const userService = {
  getAllUsersDb
};
