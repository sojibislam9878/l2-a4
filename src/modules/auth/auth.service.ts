import { jtwUtils } from "./../../../utils/jwt";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type { ILogInPayload, IRegisterUserPayload } from "./auth.interface";
import envConfig from "../../config/envConfiq";
import type { SignOptions } from "jsonwebtoken";
import AppError from "../../../utils/AppError";

const userLogInDB = async (payload: ILogInPayload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(404, "User not exist");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Invalid credentials");
  }

  const { password, ...userWithoutPassword } = user;
  const accessToken = jtwUtils.createToken(
    userWithoutPassword,
    envConfig.jwt_access_secret,
    { expiresIn: envConfig.jwt_access_expires_in } as SignOptions,
  );
  return { accessToken, userWithoutPassword };
};

const registerUserDB = async (payload: IRegisterUserPayload) => {
  const { role, ...rest } = payload;

  // only "customer" or "technician" can be chosen at registration
  const allowedRoles = ["customer", "technician"];
  if (role && !allowedRoles.includes(role)) {
    throw new AppError(400, "Invalid role. Allowed: customer, technician");
  }
  const userRole = role ?? "customer";

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(envConfig.bcrypt_salt_rounds),
  );

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        ...rest,
        password: hashedPassword,
        role: userRole,
      },
    });

    // technicians get an empty profile to fill in later via PUT /technician/profile
    if (userRole === "technician") {
      await tx.technicianProfile.create({
        data: { user_id: user.id },
      });
    }

    return user;
  });

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

const getMeDB = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not exist");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const authService = {
  userLogInDB,
  registerUserDB,
  getMeDB,
};
