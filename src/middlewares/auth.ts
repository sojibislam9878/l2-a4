import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import envConfig from "../config/envConfiq";
import { prisma } from "../lib/prisma";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized. Please log in first.",
      });
    }

    const decoded = jwt.verify(
      accessToken,
      envConfig.jwt_access_secret,
    ) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "You are not authorized. User not found.",
      });
    }

    (req as Request & { user?: typeof user }).user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: 401,
      message: "Invalid or expired token.",
    });
  }
};

export default auth;
