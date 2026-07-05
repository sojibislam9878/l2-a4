import { jtwUtils } from './../../../utils/jwt';
import bcrypt  from 'bcrypt';
import { prisma } from "../../lib/prisma";
import type { ILogInPayload } from "./auth.interface";
import envConfig from '../../config/envConfiq';
import type { SignOptions } from 'jsonwebtoken';

const userLogInDB = async (payload: ILogInPayload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new Error("User not exist");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  const { password , ...userWithoutPassword} = user
  const accessToken = jtwUtils.createToken(user, envConfig.jwt_access_secret, {expiresIn: envConfig.jwt_access_expires_in} as SignOptions)
  const refreshToken = jtwUtils.createToken(user, envConfig.jwt_refresh_secret, {expiresIn: envConfig.jwt_refresh_expires_in} as SignOptions)
  return  {accessToken, refreshToken, userWithoutPassword}
};


export const authService = {
    userLogInDB
}
