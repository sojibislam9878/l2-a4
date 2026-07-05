import envConfig from "../../config/envConfiq";
import { prisma } from "../../lib/prisma";
import type { IRegisterUserPayload } from "./user.interface";
import bcrypt from "bcrypt";

const getAllUsersDb = async () => {
  const data = await prisma.user.findMany();
  return data;
};

const resisterUserInDB = async (payload: IRegisterUserPayload) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(envConfig.bcrypt_salt_rounds),
  );
  console.log(hashedPassword);
  const result = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const getMeDB = async () =>{
  const result = "it's me";
  return result 
}

export const userService = {
  getAllUsersDb,
  resisterUserInDB,
  getMeDB
};
