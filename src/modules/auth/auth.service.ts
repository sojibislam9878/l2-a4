import { jtwUtils } from "./../../../utils/jwt";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import type { ILogInPayload, IRegisterUserPayload } from "./auth.interface";
import envConfig from "../../config/envConfiq";
import type { SignOptions } from "jsonwebtoken";
import AppError from "../../../utils/AppError";
import type { WeekDay } from "../../../generated/prisma/client";

const defaultAvailability: {
  day: WeekDay;
  start_time: string;
  end_time: string;
}[] = [
  { day: "sunday", start_time: "09:00", end_time: "17:00" },
  { day: "monday", start_time: "09:00", end_time: "17:00" },
  { day: "tuesday", start_time: "09:00", end_time: "17:00" },
  { day: "wednesday", start_time: "09:00", end_time: "17:00" },
  { day: "thursday", start_time: "09:00", end_time: "17:00" },
];

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
  const allowedFields = ["name", "email", "phone_no", "password", "role"];
  const extraFields = Object.keys(payload).filter(
    (key) => !allowedFields.includes(key),
  );
  if (extraFields.length > 0) {
    throw new AppError(400, `Unknown field(s): ${extraFields.join(", ")}`);
  }

  const { name, email, phone_no, password, role } = payload;

  const allowedRoles = ["customer", "technician"];
  if (role && !allowedRoles.includes(role)) {
    throw new AppError(400, "Invalid role. Allowed: customer, technician");
  }
  const userRole = role ?? "customer";

  const hashedPassword = await bcrypt.hash(
    password,
    Number(envConfig.bcrypt_salt_rounds),
  );

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email,
        phone_no,
        password: hashedPassword,
        role: userRole,
      },
    });

    if (userRole === "technician") {
      const profile = await tx.technicianProfile.create({
        data: { user_id: user.id },
      });

      await tx.availability.createMany({
        data: defaultAvailability.map((slot) => ({
          technician_id: profile.id,
          ...slot,
        })),
      });
    }

    return user;
  });

  const { password: _password, ...userWithoutPassword } = result;
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
